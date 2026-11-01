import os
from datetime import datetime
from flask import Flask, request, render_template, redirect, url_for, session,flash, jsonify
from werkzeug.utils import secure_filename
import hashlib
import re
import db



UPLOAD_FOLDER = 'static/uploads'

app = Flask(__name__,  template_folder="static/src/html", static_folder="static")


app.secret_key = "s3cr3t_k3y"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000


# --- Routes ---
@app.route("/", methods=["GET"])
def index():
    ultimos_av =db.ultimos_avistamientos(limit=2)
    return render_template("Interfaz.html", ultimos_av=ultimos_av) 



@app.route("/voluntario/nuevo", methods=["GET","POST"])
def registrar_voluntario():
    regiones = db.get_regiones()
    error = ""

    if request.method == "POST":
        nombre = (request.form.get("nombre") or "").strip()
        usuario = (request.form.get("usuario") or "").strip()
        email = (request.form.get("email") or "").strip()
        numero = (request.form.get("numero") or "").strip()
        comuna_id = request.form.get("comuna")
        num_limpio = numero.replace(" ", "").replace("+56", "")

        if len(nombre) < 3:
            error = "El nombre debe tener al menos 3 caracteres."
        elif len(usuario) < 3:
            error = "El usuario debe tener al menos 3 caracteres."
        elif not (len(num_limpio) == 9 and num_limpio.isdigit()):
            error = "El número de celular debe tener 9 dígitos y solo contener números."
        elif not email or " " in email or email.count("@") != 1 or email.startswith("@") or email.endswith("@"):
            error = "El correo electrónico no es válido."
        elif "." not in email.split("@")[1] or  email.split("@")[1].endswith("."):
            error = "El correo electrónico no es válido."
        elif not comuna_id:
            error = "Debe seleccionar una comuna."
        
        if error:
            return render_template("Registro.html", error=error, nombre=nombre, email=email, numero=numero, comuna_id=comuna_id, regiones=regiones)

        comunaid = int(comuna_id) if str(comuna_id).isdigit() else 1
        
        db.create_voluntario(nombre, email, numero, comunaid)
        flash("Voluntario registrado exitosamente.")
        return redirect(url_for("index"))

    return render_template("Registro.html", regiones=regiones)


@app.route("/avistamiento/nuevo", methods=["GET", "POST"])
def registrar_avistamiento():
    voluntarios = db.get_voluntarios()
    tipos_ave = db.get_aves()
    regiones = db.get_regiones()
    comuna_id= request.form.get("comuna")
    error = ""

    if request.method == "POST":
        fecha_hora = request.form.get("fecha")
        comuna_id = request.form.get("comuna")
        voluntario_id = request.form.get("voluntario_id")
        tipo_ave_id = request.form.get("filtro-tipo")
        nombre_ave = (request.form.get("nombre") or "").strip()
        sector = (request.form.get("lugar") or "").strip()

        archivos = []
        for i in range(1,6):
            archivo = request.files.get(f"foto{i}")
            if archivo and archivo.filename != "":
                archivos.append(archivo)

        ahora_iso = datetime.now().isoformat()[:16]
        
        if not voluntario_id:
            primer_voluntario = db.get_primer_voluntario()
            voluntario_id = primer_voluntario.id if primer_voluntario else 1    

        if len(nombre_ave) < 3:
            error = "El nombre del ave debe tener al menos 3 caracteres."
        elif len(sector) < 3:
            error = "El sector debe tener al menos 3 caracteres."
        elif not comuna_id:
            error = "Debe seleccionar una comuna."
        elif not tipo_ave_id:
            error = "Debe seleccionar un tipo de ave."
        elif not fecha_hora:
            error = "Debe ingresar la fecha y hora del avistamiento."
        elif fecha_hora > ahora_iso:
            error = "La fecha y hora del avistamiento no puede ser en el futuro."
        elif len(archivos) == 0:
            error = "Debe subir al menos una foto o video del avistamiento."

        if error:
            return render_template("Formulario.html", error=error, voluntarios=voluntarios, tipos_ave=tipos_ave, regiones=regiones)


        ave_id = db.get_or_create_ave(nombre_ave)
        fecha_bd = datetime.strptime(fecha_hora, "%Y-%m-%dT%H:%M") if "T" in fecha_hora else datetime.now()
        voluntarioid = int(voluntario_id) if str(voluntario_id).isdigit() else 1
        av_id = db.create_avistamiento(voluntario_id=voluntarioid, ave_id=ave_id, fecha_hora=fecha_bd, lugar=sector, descripcion=f"Tipo:{tipo_ave_id}")

        upload_path = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'])
        os.makedirs(upload_path, exist_ok = True)

        for archivo in archivos: 
            nombre_limpio = secure_filename(archivo.filename)
            nombre_guardar = f"{av_id}_{nombre_limpio}"
            ruta_abs = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], nombre_guardar)

            archivo.seek(0)
            archivo.save(ruta_abs)

            ruta_rel = f"uploads/{nombre_guardar}"
            db.create_registro(av_id, ruta_rel, nombre_limpio)

        flash("Avistamiento registrado exitosamente.")
        return redirect(url_for("index"))


    return render_template("Formulario.html", voluntarios=voluntarios, tipos_ave=tipos_ave, regiones=regiones)



@app.route("/listado", methods=["GET"])
def listado():
    page = request.args.get("page", 1, type=int)
    tipo_filtro = request.args.get("filtro-tipo", "").strip() or None
    orden = request.args.get("orden-tipo", "").strip() or None
    page_size = 5

    tipos_ave=db.get_aves() 

    avistamientos, total_items = db.avistamientos_lista(page=page, page_size=page_size, tipo_ave=tipo_filtro, orden=orden)
    total_pages = max(1, (total_items + page_size - 1) // page_size)

    return render_template("Listado.html", avistamientos=avistamientos,tipos_ave=tipos_ave, page=page, total_pages=total_pages,filtro_actual=tipo_filtro, orden_actual=orden)


@app.route("/listado/<int:avistamiento_id>", methods=["GET"])
def detalle_avistamiento(avistamiento_id):
    with db.SessionLocal() as session:
        avistamiento = session.query(db.Avistamiento).filter(db.Avistamiento.id == avistamiento_id).first()
        if not avistamiento:
            return "Avistamiento no encontrado", 404
        return render_template("detalle.html", avistamiento=avistamiento)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/api/comunas/<int:region_id>")
def api_comunas(region_id):
    comunas = db.get_comunas_by_region(region_id)
    return jsonify(comunas)


@app.route("/estadisticas", methods=["GET"])
def estadisticas():
    return render_template("Estadisticas.html")

@app.route("/api/stats-dias", methods=["GET"])
def api_dias():
    return jsonify(db.get_stats_dias())

@app.route("/api/stats-tipos", methods=["GET"])
def api_tipos():
    return jsonify(db.get_stats_tipos())

@app.route("/api/stats-comunas", methods=["GET"])
def api_stats_comunas():
    return jsonify(db.get_stats_comunas())


@app.route("/api/avistamiento/<int:id>/comentarios", methods=["GET", "POST"])
def comentarios_api(id):
    if request.method == "POST":
        data = request.get_json(silent= True) or request.form
        nombre = data.get("nombre", "").strip()
        texto = data.get("texto", "").strip()

        if not(3 <=len(nombre) <=50) or len(texto) < 5:
            return jsonify({"error":"Nombre (3 a 50 caracteres) y comentario (al menos 5 caracteres)."}), 400

        nuevo=db.add_comentario(id, nombre, texto)
        return jsonify(nuevo), 201

    return jsonify(db.get_comentarios(id))


if __name__ == "__main__":
    app.run(debug=True)