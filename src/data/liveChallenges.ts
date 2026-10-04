import type { LiveChallengeConfig } from '../types.ts'

export const LIVE_CHALLENGES: LiveChallengeConfig[] = [
  {
    id: 'control_acceso',
    title: 'Control de Acceso a Sala',
    description: 'Filtrado de seguridad para ingreso a laboratorios de cómputo.',
    mission: 'Un sistema debe permitir que una persona ingrese a una sala solamente si presenta una credencial válida, dentro del horario habilitado y si la capacidad de la sala no supera el límite.',
    availableCards: [
      { id: 'recibir_credencial', label: 'RECIBIR CREDENCIAL', category: 'action', icon: '🪪' },
      { id: 'leer_credencial', label: 'LEER CREDENCIAL', category: 'action', icon: '🔎' },
      { id: 'verificar_credencial', label: 'VERIFICAR CREDENCIAL', category: 'condition', icon: '🛡️' },
      { id: 'comprobar_horario', label: 'COMPROBAR HORARIO', category: 'condition', icon: '⏰' },
      { id: 'comprobar_capacidad', label: 'COMPROBAR CAPACIDAD', category: 'condition', icon: '👥' },
      { id: 'permitir', label: 'PERMITIR ACCESO', category: 'result', icon: '🚪' },
      { id: 'rechazar', label: 'RECHAZAR ACCESO', category: 'result', icon: '⛔' },
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'Credencial inválida o no registrada',
        inputs: { credencialValida: false, horarioValido: true, capacidadOk: true },
        expectedResult: 'RECHAZAR',
      },
      {
        id: 'tc2',
        description: 'Credencial válida pero fuera de horario',
        inputs: { credencialValida: true, horarioValido: false, capacidadOk: true },
        expectedResult: 'RECHAZAR',
      },
      {
        id: 'tc3',
        description: 'Credencial y horario válidos, pero sala colmada',
        inputs: { credencialValida: true, horarioValido: true, capacidadOk: false },
        expectedResult: 'RECHAZAR',
      },
      {
        id: 'tc4',
        description: 'Todas las condiciones aprobadas (caso exitoso)',
        inputs: { credencialValida: true, horarioValido: true, capacidadOk: true },
        expectedResult: 'PERMITIR',
      },
    ],
    validateSolution: (solution: any) => {
      // solution represents the sequence or structure of cards
      if (!solution || !Array.isArray(solution.steps)) {
        return { isValid: false, message: 'La solución no contiene un flujo de tarjetas válido.' }
      }

      const steps: string[] = solution.steps
      const idxRecibir = steps.indexOf('recibir_credencial')
      const idxLeer = steps.indexOf('leer_credencial')
      const idxVerificar = steps.indexOf('verificar_credencial')
      const idxHorario = steps.indexOf('comprobar_horario')
      const idxCapacidad = steps.indexOf('comprobar_capacidad')
      const idxPermitir = steps.indexOf('permitir')

      if (idxRecibir === -1) {
        return { isValid: false, message: 'Falta la tarjeta de acción inicial [ RECIBIR CREDENCIAL ].' }
      }
      if (idxLeer === -1) {
        return { isValid: false, message: 'Falta la tarjeta [ LEER CREDENCIAL ] antes del análisis.' }
      }
      if (idxVerificar === -1) {
        return { isValid: false, message: 'Falta la verificación de credencial [ VERIFICAR CREDENCIAL ].' }
      }
      if (idxHorario === -1) {
        return { isValid: false, message: 'Falta la comprobación de horario [ COMPROBAR HORARIO ].' }
      }
      if (idxCapacidad === -1) {
        return { isValid: false, message: 'Falta comprobar el límite de aforo [ COMPROBAR CAPACIDAD ].' }
      }
      if (idxPermitir === -1) {
        return { isValid: false, message: 'Falta la instrucción final de salida [ PERMITIR ACCESO ].' }
      }

      // Check logical order
      if (idxRecibir > idxLeer) {
        return { isValid: false, message: 'El lector no puede leer la credencial antes de que la persona la apoye o inserte.' }
      }
      if (idxLeer > idxVerificar) {
        return { isValid: false, message: 'El sistema no puede verificar credenciales sin haber leído sus datos.' }
      }
      if (idxVerificar > idxPermitir || idxHorario > idxPermitir || idxCapacidad > idxPermitir) {
        return { isValid: false, message: 'El acceso no puede permitirse antes de haber superado todas las comprobaciones de seguridad.' }
      }

      return { isValid: true, message: '¡Algoritmo completamente correcto y validado!' }
    },
  },
  {
    id: 'semaforo_inteligente',
    title: 'Semáforo Inteligente Peatonal',
    description: 'Control de cruce de peatones con prioridad de emergencias.',
    mission: 'Un semáforo debe detener a los vehículos cuando un peatón presione el botón de cruce, pero debe dar paso inmediato prioritario si un sensor detecta una ambulancia de emergencia.',
    availableCards: [
      { id: 'sensor_emergencia', label: 'SENSOR DE EMERGENCIA', category: 'condition', icon: '🚑' },
      { id: 'sensor_boton', label: 'BOTÓN PEATONAL', category: 'condition', icon: '🚶' },
      { id: 'temporizador_minimo', label: 'ESPERAR TIEMPO MÍNIMO', category: 'action', icon: '⏱️' },
      { id: 'luz_verde_peaton', label: 'HABILITAR CRUCE PEATONAL', category: 'result', icon: '🟢' },
      { id: 'luz_verde_autos', label: 'MANTENER PASO VEHICULAR', category: 'result', icon: '🚗' },
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'Llega ambulancia en código rojo',
        inputs: { emergencia: true, botonPresionado: true },
        expectedResult: 'RECHAZAR', // Paso vehicular prioritario
      },
      {
        id: 'tc2',
        description: 'Peatón presiona botón sin emergencia',
        inputs: { emergencia: false, botonPresionado: true },
        expectedResult: 'PERMITIR', // Habilitar cruce peatonal
      },
    ],
    validateSolution: (solution: any) => {
      if (!solution || !Array.isArray(solution.steps)) {
        return { isValid: false, message: 'Falta un flujo de tarjetas válido.' }
      }
      const steps: string[] = solution.steps
      if (!steps.includes('sensor_emergencia')) {
        return { isValid: false, message: 'Falta verificar la prioridad máxima de ambulancias.' }
      }
      if (!steps.includes('sensor_boton')) {
        return { isValid: false, message: 'Falta evaluar el botón peatonal.' }
      }
      if (!steps.includes('luz_verde_peaton')) {
        return { isValid: false, message: 'Falta la acción de habilitar el cruce peatonal.' }
      }
      return { isValid: true, message: '¡Algoritmo de semáforo inteligente validado!' }
    },
  },
  {
    id: 'cajero_automatico',
    title: 'Cajero Automático / Dispensador',
    description: 'Validación de seguridad y fondos bancarios.',
    mission: 'Un cajero debe autenticar el PIN del cliente, verificar que el saldo en cuenta sea suficiente y asegurarse de que el monto solicitado no exceda el límite diario de retiro.',
    availableCards: [
      { id: 'solicitar_pin', label: 'SOLICITAR Y COMPROBAR PIN', category: 'condition', icon: '🔢' },
      { id: 'comprobar_saldo', label: 'COMPROBAR SALDO SUFICIENTE', category: 'condition', icon: '💰' },
      { id: 'comprobar_limite', label: 'COMPROBAR LÍMITE DIARIO', category: 'condition', icon: '📋' },
      { id: 'entregar_dinero', label: 'ENTREGAR EFECTIVO', category: 'result', icon: '💵' },
      { id: 'rechazar_operacion', label: 'RECHAZAR OPERACIÓN', category: 'result', icon: '❌' },
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'PIN erróneo',
        inputs: { pinCorrecto: false, saldoSuficiente: true, dentroLimite: true },
        expectedResult: 'RECHAZAR',
      },
      {
        id: 'tc2',
        description: 'PIN correcto pero saldo insuficiente',
        inputs: { pinCorrecto: true, saldoSuficiente: false, dentroLimite: true },
        expectedResult: 'RECHAZAR',
      },
      {
        id: 'tc3',
        description: 'Todo correcto',
        inputs: { pinCorrecto: true, saldoSuficiente: true, dentroLimite: true },
        expectedResult: 'PERMITIR',
      },
    ],
    validateSolution: (solution: any) => {
      if (!solution || !Array.isArray(solution.steps)) {
        return { isValid: false, message: 'Falta un flujo de tarjetas válido.' }
      }
      const steps: string[] = solution.steps
      const idxPin = steps.indexOf('solicitar_pin')
      const idxSaldo = steps.indexOf('comprobar_saldo')
      const idxLimite = steps.indexOf('comprobar_limite')
      const idxEntregar = steps.indexOf('entregar_dinero')

      if (idxPin === -1 || idxSaldo === -1 || idxLimite === -1 || idxEntregar === -1) {
        return { isValid: false, message: 'Faltan tarjetas indispensables para la seguridad financiera.' }
      }
      if (idxPin > idxSaldo || idxSaldo > idxLimite || idxLimite > idxEntregar) {
        return { isValid: false, message: 'El orden de validación bancaria debe ser: PIN ➔ Saldo ➔ Límite ➔ Entrega.' }
      }
      return { isValid: true, message: '¡Algoritmo de cajero automático validado!' }
    },
  },
]
