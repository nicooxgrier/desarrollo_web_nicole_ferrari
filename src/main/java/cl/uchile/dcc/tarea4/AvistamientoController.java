package cl.uchile.dcc.tarea4;

import jakarta.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name = "comuna")
class Comuna {
    @Id Integer id;
    String nombre;
}

@Entity @Table(name = "voluntario")
class Voluntario {
    @Id Integer id;
    String nombre;
    @ManyToOne @JoinColumn(name = "comuna_id") Comuna comuna;
}

@Entity @Table(name = "ave")
class Ave {
    @Id Integer id;
    String nombre;
}

@Entity @Table(name = "avistamiento")
class Avistamiento {
    @Id Integer id;
    @ManyToOne @JoinColumn(name = "voluntario_id") Voluntario voluntario;
    @ManyToOne @JoinColumn(name = "ave_id") Ave ave;
    @Column(name = "fecha_hora") LocalDateTime fechaHora;
}

@Entity @Table(name = "nota")
class Nota {
    @Id Integer id;
    @Column(name = "avistamiento_id") Integer avistamientoId;
    Integer nota;
}

interface AvistamientoRepo extends JpaRepository<Avistamiento, Integer> {
    @Query("SELECT a FROM Avistamiento a JOIN a.voluntario v JOIN v.comuna c JOIN a.ave av " +
            "WHERE LOWER(av.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(v.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Avistamiento> buscar(@Param("q") String q);

    @Query("SELECT AVG(n.nota) FROM Nota n WHERE n.avistamientoId = :id")
    Double promedio(@Param("id") Integer id);

    @Modifying @Transactional
    @Query(value = "INSERT INTO nota (avistamiento_id, nota) VALUES (:id, :nota)", nativeQuery = true)
    void insertarNota(@Param("id") Integer id, @Param("nota") Integer nota);
}

@RestController
@RequestMapping("/api")
public class AvistamientoController {
    @Autowired AvistamientoRepo repo;

    @GetMapping("/buscar")
    public List buscar(@RequestParam(defaultValue = "") String q) {
        String texto = q.trim();
        if (texto.isEmpty()) {
            return List.of();
        }
        List lista = new ArrayList();
        for (Avistamiento a : repo.buscar(texto)) {
            Double prom = repo.promedio(a.id);
            Map fila = new HashMap();
            fila.put("id", a.id);
            fila.put("voluntario", a.voluntario.nombre);
            fila.put("dia", a.fechaHora.toLocalDate().toString());
            fila.put("ave", a.ave.nombre);
            fila.put("comuna", a.voluntario.comuna.nombre);
            fila.put("nota", prom != null ? String.format("%.1f", prom) : "-");
            lista.add(fila);
        }
        return lista;
    }

    @PostMapping("/avistamientos/{id}/notas")
    public ResponseEntity guardarNota(@PathVariable Integer id, @RequestBody Map body) {
        if (!repo.existsById(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Avistamiento no encontrado"));
        }
        int val;
        try {
            val = Integer.parseInt(String.valueOf(body.get("nota")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nota inválida, debe ser entre 1 y 7"));
        }

        if (val < 1 || val > 7) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nota inválida, debe ser entre 1 y 7"));
        }

        repo.insertarNota(id, val);
        Double nuevoProm = repo.promedio(id);
        return ResponseEntity.ok(Map.of("promedio", String.format("%.1f", nuevoProm)));
    }
}