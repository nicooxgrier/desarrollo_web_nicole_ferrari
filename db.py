from sqlalchemy import create_engine, Column, Integer, BigInteger, String, ForeignKey, DateTime, func, Text, asc,desc
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, joinedload
from datetime import datetime


DB_NAME = "tarea2"
DB_USERNAME = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST = "localhost"
DB_PORT = 3306

DATABASE_URL = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

# --- Models ---

class Region(Base):
    __tablename__ = 'region'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    comunas=relationship("Comuna", back_populates="region")

class Comuna(Base):
    __tablename__ = 'comuna'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    region_id = Column(Integer, ForeignKey('region.id'), nullable=False)
    
    region = relationship("Region", back_populates="comunas", lazy="joined")
    voluntarios = relationship("Voluntario", back_populates="comuna", lazy="joined")


class Voluntario(Base):
    __tablename__ = 'voluntario'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=False)
    fecha_registro = Column(DateTime, nullable=False, default=datetime.now)
    comuna_id = Column(Integer, ForeignKey('comuna.id'), nullable=False)
    
    comuna = relationship("Comuna", back_populates="voluntarios", lazy="joined")
    avistamientos = relationship("Avistamiento", back_populates="voluntario", lazy="joined")



class Ave(Base):
    __tablename__ = 'ave'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre= Column(String(255), nullable=False)
    avistamientos = relationship("Avistamiento", back_populates="ave")


class Avistamiento(Base):
    __tablename__ = 'avistamiento'

    id = Column(Integer, primary_key=True, autoincrement=True)
    voluntario_id = Column(Integer, ForeignKey('voluntario.id'), nullable=False)
    ave_id = Column(Integer, ForeignKey('ave.id'), nullable=False)
    fecha_hora = Column(DateTime, nullable=False)
    lugar = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)

    voluntario = relationship("Voluntario", back_populates="avistamientos", lazy ="joined")
    ave = relationship("Ave", back_populates="avistamientos", lazy = "joined")
    registros = relationship("Registro", back_populates="avistamiento", lazy ="joined")

class Registro(Base):
    __tablename__ = 'registro'

    id = Column(Integer, primary_key=True, autoincrement=True)
    ruta_archivo = Column(String(255), nullable=False)
    nombre_archivo = Column(String(255), nullable=False)
    avistamiento_id = Column(Integer, ForeignKey('avistamiento.id'), nullable=False)

    avistamiento = relationship("Avistamiento", back_populates="registros")

# --- Database Functions ---
def get_regiones():
    with SessionLocal() as session:
        return session.query(Region).order_by(Region.id).all()

def get_comunas_by_region(region_id):
    with SessionLocal() as session:
        comunas = session.query(Comuna).filter_by(region_id=region_id).order_by(Comuna.nombre).all()
        return [{"id": c.id, "nombre": c.nombre} for c in comunas]

def get_todas_comunas():
    with SessionLocal() as session:
        return session.query(Comuna).order_by(Comuna.nombre).all()


def get_aves():
    with SessionLocal() as session:
        return session.query(Ave).order_by(Ave.nombre).all()


def get_voluntarios():
    with SessionLocal() as session:
        return session.query(Voluntario).order_by(Voluntario.nombre).all() 



def get_primer_voluntario():
    with SessionLocal() as session:
        return session.query(Voluntario).first()


def create_voluntario(nombre, email, telefono, comuna_id):
    with SessionLocal() as session:
        nuevo_voluntario = Voluntario(nombre=nombre, email=email, telefono=telefono, comuna_id=comuna_id)
        session.add(nuevo_voluntario)
        session.commit()
        session.refresh(nuevo_voluntario)
        return nuevo_voluntario.id


def get_or_create_ave(nombre_ave):
    with SessionLocal() as session:
        ave = session.query(Ave).filter(func.lower(Ave.nombre) == nombre_ave.lower()).first()
        if not ave:
            ave = Ave(nombre=nombre_ave)
            session.add(ave)
            session.commit()
            session.refresh(ave)
        return ave.id


def create_avistamiento(voluntario_id, ave_id, fecha_hora, lugar, descripcion= None):
    with SessionLocal() as session:
        nuevo_avistamiento = Avistamiento(voluntario_id=voluntario_id, ave_id=ave_id, fecha_hora=fecha_hora, lugar=lugar, descripcion=descripcion)
        session.add(nuevo_avistamiento)
        session.commit()
        session.refresh(nuevo_avistamiento)
        return nuevo_avistamiento.id


def create_registro(avistamiento_id, ruta_archivo, nombre_archivo):
    with SessionLocal() as session:
        nuevo_registro = Registro(avistamiento_id=avistamiento_id, ruta_archivo=ruta_archivo, nombre_archivo=nombre_archivo)
        session.add(nuevo_registro)
        session.commit()
        session.refresh(nuevo_registro)
        return nuevo_registro.id


def ultimos_avistamientos(limit=2):
    with SessionLocal() as session:
        return session.query(Avistamiento).order_by(Avistamiento.id.desc()).limit(limit).all()


def avistamientos_lista(page=1, page_size=3,tipo_ave=None, orden=None):
    with SessionLocal() as session:
        query = session.query(Avistamiento).join(Avistamiento.ave)

        if tipo_ave and tipo_ave.strip():
            query = query.filter(func.lower(Ave.nombre) == tipo_ave.strip().lower())

        if orden == "fecha-crec":
            query = query.order_by(asc(Avistamiento.fecha_hora))
        elif orden == "fecha-decr":
            query = query.order_by(desc(Avistamiento.fecha_hora))
        elif orden == "lugar-crec":
            query = query.order_by(asc(Avistamiento.lugar))
        elif orden == "lugar-decr":
            query = query.order_by(desc(Avistamiento.lugar))
        else:
            query = query.order_by(desc(Avistamiento.id))

        total_items = query.count()
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total_items

def get_estadisticas():
    with SessionLocal() as session:
        total_voluntarios = session.query(func.count(Voluntario.id)).scalar() or 0
        total_avistamientos = session.query(func.count(Avistamiento.id)).scalar() or 0
    
        return {
            "total_avistamientos": total_avistamientos,
            "total_voluntarios": total_voluntarios,
        }
