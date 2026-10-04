# CODE: DEL PROBLEMA AL PROGRAMA
### Introducción al Pensamiento Algorítmico

Aplicación web didáctica e interactiva diseñada como recurso para una clase virtual de **10 a 12 minutos** orientada a **adolescentes de 15 años de secundaria técnica**.

Funciona como una **pizarra interactiva + mini laboratorio de programación**, diseñada específicamente para que el docente controle el ritmo de exposición sin avances automáticos.

---

## 🎯 Pregunta Guía Pedagógica
> **"¿Cómo podemos transformar un problema en instrucciones que una computadora pueda ejecutar?"**

### Premisa Fundamental
**Programar no comienza frente a una computadora. Comienza con una idea y con el razonamiento del estudiante.**

$$\text{PROBLEMA} \rightarrow \text{PENSAR} \rightarrow \text{ESCRIBIR} \rightarrow \text{ORDENAR} \rightarrow \text{EJECUTAR} \rightarrow \text{DETECTAR} \rightarrow \text{CORREGIR} \rightarrow \text{PROGRAMAR}$$

---

## 🧭 Recorrido de la Experiencia (11 Pantallas / Etapas)

1. **Portada Tecnológica:** Título impactante, pregunta disparadora y botón para iniciar sin adelantar teoría.
2. **Preguntas Disparadoras:** 3 preguntas de reflexión secuenciales reveladas por clics del docente para pausar y debatir.
3. **El Circuito Central:** Diagrama circular dinámico alrededor del núcleo `PROBLEMA` con los 7 nodos orbitando y revelándose uno a uno con animación e iluminación.
4. **¿Qué es un Algoritmo?:** Definición sintética, ejemplo cotidiano de preparar jugo en 5 pasos y mini cuestionario interactivo con feedback.
5. **La Computadora No Adivina (Precisión):** Instrucción ambigua ("Prepará una pizza") vs versión algorítmica detallada de 6 pasos.
6. **Ahora te Toca a Vos (Transición):** Enfoque pedagógico: *Sin tecnología $\rightarrow$ Pensamiento $\rightarrow$ Algoritmo $\rightarrow$ Tecnología*.
7. **Desafío 1 - Ordenar el Algoritmo (+10 pts):** Sistema de molinete escolar. Drag & drop y flechas táctiles, ejecución simulada y diagnóstico detallado de errores en la secuencia.
8. **Desafío 2 - Rompé el Programa (+10 pts):** Algoritmo con error de secuencia. Selección del paso defectuoso, concepto de **DEPURAR** y ciclo *ERROR $\rightarrow$ DETECTAR $\rightarrow$ CORREGIR $\rightarrow$ PROBAR*.
9. **Desafío Final - Creá la Solución (+20 pts):** Construcción libre de la lógica de acceso a partir de una paleta de bloques y simulación interactiva con confetti.
10. **¿Y Dónde Aparece el Código?:** Conexión visual directa entre la decisión algorítmica y Python (`if tarjeta_valida:`), editor interactivo con consola en vivo.
11. **Resumen y Cierre:** Recapitulación de los 7 pasos, frases conceptuales de impacto, puntaje acumulado y opciones de reinicio o repaso.

---

## 🕹️ Controles para el Docente

- **Navegación al ritmo de la voz:** Ninguna pantalla avanza automáticamente.
- **Teclado:** Podés usar las teclas `Flecha Derecha` / `AvPág` para avanzar y `Flecha Izquierda` / `RePág` para retroceder (compatible con clickers de presentación).
- **Menú Rápido de Etapa:** En la barra superior, el selector permite saltar directamente a cualquier sección si algún alumno hace preguntas.
- **Sonidos:** Efectos sonoros sintetizados nativamente (Web Audio API) con botón de silenciar en el header.
- **Puntaje didáctico:** Registra aciertos de manera motivacional y se persiste localmente en el navegador (`localStorage`).
- **Responsive:** Adaptado a pantallas grandes de proyección, notebooks, tablets y teléfonos móviles con botones táctiles alternativos al drag & drop.

---

## 🚀 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Web Audio API** (Sintetizador de sonido integrado sin archivos externos)
- **Canvas Confetti**
