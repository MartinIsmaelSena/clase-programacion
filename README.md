# CODE: DEL PROBLEMA AL PROGRAMA
### Introducción al Pensamiento Algorítmico

Aplicación web interactiva y didáctica diseñada para:
1. **Acompañar una clase virtual de 10 a 12 minutos** orientada a **estudiantes de secundaria técnica (15 años)**, funcionando como pizarra interactiva y mini laboratorio de lógica.
2. **Ser compartida posteriormente con los estudiantes** para que puedan ingresar libremente por su cuenta, practicar a su propio ritmo, comprobar sus resultados y corregir errores.
3. **Ofrecer un modo especial multijugador en tiempo real: `⚡ DESAFÍO EN VIVO`**, permitiendo al docente lanzar retos con temporizador sincronizado, ranking y validación automática de soluciones en vivo.

---

## 🎯 Pregunta Guía
> **"¿Cómo podemos transformar un problema en instrucciones que una computadora pueda ejecutar?"**

### Premisa Fundamental
**Programar no comienza frente a una computadora. Comienza con una idea y con el razonamiento del estudiante.**

$$\text{PROBLEMA} \rightarrow \text{PENSAR} \rightarrow \text{ESCRIBIR} \rightarrow \text{ORDENAR} \rightarrow \text{EJECUTAR} \rightarrow \text{DETECTAR} \rightarrow \text{CORREGIR} \rightarrow \text{PROGRAMAR}$$

---

## 🧭 Recorrido de la Experiencia Individual (12 Etapas)

1. **Portada:** Título impactante, pregunta disparadora y botón `[ COMENZAR ]`.
2. **Antes de Programar:** Preguntas disparadoras de reflexión con avance controlado por el usuario.
3. **El Circuito Central:** Diagrama circular dinámico alrededor del núcleo `PROBLEMA` con los 7 nodos orbitando y revelándose uno a uno con animación e iluminación.
4. **¿Qué es un Algoritmo?:** Definición sintética, ejemplo cotidiano del vaso de jugo con reordenamiento interactivo y feedback formativo.
5. **La Computadora No Adivina (Precisión):** Instrucción ambigua ("Prepará una pizza") vs versión algorítmica detallada de 6 pasos.
6. **Ahora te Toca a Vos (Transición):** Enfoque: *Sin tecnología $\rightarrow$ Pensamiento $\rightarrow$ Algoritmo $\rightarrow$ Tecnología*.
7. **Desafío 1 - Ordená el Algoritmo (+10 pts):** Control de acceso escolar con tarjetas (`Recibir`, `Leer`, `Verificar`, `Permitir`, `Rechazar`). Drag & drop y flechas táctiles, ejecución simulada y diagnóstico detallado de errores.
8. **Desafío 2 - Rompé el Programa (+10 pts):** Algoritmo con error de secuencia. Detección del bug, concepto de **DEPURAR** y ciclo *ERROR $\rightarrow$ DETECTAR $\rightarrow$ CORREGIR $\rightarrow$ PROBAR*.
9. **Desafío 3 - Sistema de Acceso con Dos Condiciones (+15 pts):** Tarjeta válida + Horario permitido. Constructor de decisiones con **MODO PRUEBA** automático de 4 casos en tiempo real (`0/4` a `4/4`).
10. **Desafío Final - Sistema de Seguridad (+20 pts):** Árbol de decisiones visual por nodos y caminos controlando 3 condiciones: Tarjeta válida, Horario permitido y Aforo máximo de sala (30 personas).
11. **¿Y Dónde Aparece la Programación?:** Puente conceptual: $\text{PROBLEMA} \rightarrow \text{ALGORITMO} \rightarrow \text{CÓDIGO}$. Mini editor Python interactivo con `if tarjeta_valida:` y consola de ejecución en vivo.
12. **Resumen y Cierre:** Recapitulación de los 7 pasos, frases conceptuales de impacto, puntaje acumulado y opciones de reinicio o repaso.

---

## ⚡ NUEVO MODO: DESAFÍO EN VIVO (Multijugador en Tiempo Real)

Permite al docente habilitar una competencia lógica en vivo para el grupo de estudiantes y observar en tiempo real quién consigue resolverlo correctamente en el menor tiempo.

### 👨‍🏫 Modo Docente
1. Acceso mediante clave segura (`docente2026`).
2. Selección de desafío preparado (`Control de Acceso a Sala`, `Semáforo Inteligente`, `Cajero Automático`).
3. Generación automática de código corto (ej: `CODE-42`).
4. **Sala de espera en tiempo real** donde se observa a los estudiantes que van ingresando.
5. Botón `[ ▶ INICIAR DESAFÍO ]`: activa simultáneamente el cronómetro en todos los dispositivos.
6. **Tabla de posiciones en tiempo real**: muestra a cada estudiante con su estado (`🟡 Resolviendo`, `🟢 Completado`, `⚠️ En revisión`), número de intentos y tiempo de resolución.
7. Detección automática del ganador: **🥇 ¡TENEMOS GANADOR!**.
8. Podio oficial de los 3 primeros puestos y estadísticas de algoritmos completados.

### 👩‍🎓 Experiencia del Estudiante
1. El estudiante hace clic en `⚡ Desafío en Vivo` (sin necesidad de crear cuentas).
2. Ingresa su Nombre, Apellido y Código del desafío (`CODE-42`).
3. Permanece en la sala de espera hasta que el docente inicia la sesión.
4. Recibe la misión y el **tablero de lógica**: conecta tarjetas de acción y comprobación.
5. Dispone del botón `[ 🧪 Probar ]` para validar su lógica antes de enviar.
6. Envía la solución con `[ 🚀 Enviar Solución Final ]`.
7. El servidor valida la lógica de forma segura e impermeable a trampas y registra el tiempo exacto.

---

## 🛠️ Arquitectura de Sincronización en Tiempo Real

- **Servidor WebSocket Integrado:** Se ejecuta automáticamente tanto en desarrollo (`npm run dev`) como en producción (`node server.js` o `npm run serve:live`) sin requerir servicios pagos ni cuentas externas. Funciona en red local / Wi-Fi del aula (`192.168.x.x`).
- **Respaldo con BroadcastChannel:** Permite probar el modo multijugador abriendo múltiples pestañas en el mismo navegador.
- **Preparado para Supabase:** Incluye el script SQL `supabase_schema.sql` listo para desplegar en Supabase Realtime si se prefiere una base de datos cloud.
- **Catálogo extensible de desafíos:** Ubicado en `src/data/liveChallenges.ts`, preparado para incorporar nuevos desafíos sin modificar la interfaz.

---

## 🚀 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo (incluye servidor WebSocket en el puerto 5173)
npm run dev

# 3. Compilar para producción
npm run build

# 4. Servidor de producción standalone con WebSocket
npm run serve:live
```

---

## 📱 Compatibilidad y Responsive
- Funciona en PC de escritorio, notebooks, tablets y teléfonos celulares.
- Todas las interacciones de tarjetas disponen de botones táctiles (flechas arriba/abajo) además de Drag & Drop para pantallas táctiles.
