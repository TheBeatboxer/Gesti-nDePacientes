# TODO: Implementación del Chat Paciente-Enfermera

## Backend

- [x] **1. Configurar Socket.IO:**
    - [x] Adjuntar Socket.IO al servidor HTTP de Express en `src/index.js`.
    - [x] Crear un manejador de conexión básico para `socket.io`.

- [x] **2. Autenticación y Salas:**
    - [x] Implementar la autenticación de sockets mediante JWT.
    - [x] Crear una lógica para que los usuarios se unan a salas de chat privadas (ej: `chat_<pacienteId>_<enfermeraId>`).

- [x] **3. Manejo de Mensajes:**
    - [x] Crear el manejador del lado del servidor para el evento `sendMessage`.
    - [x] Guardar los mensajes en la base de datos usando el modelo `Message`.
    - [x] Retransmitir los mensajes a la sala de chat adecuada.

- [x] **4. API para Historial:**
    - [x] Implementar la ruta `GET /api/chat/history/:user1Id/:user2Id` para obtener el historial de chat.

## Frontend

- [x] **5. Servicio de Chat (`chat.service.ts`):**
    - [x] Crear el servicio `ChatService`.
    - [x] Implementar la conexión y autenticación con Socket.IO.
    - [x] Crear un método `sendMessage` para enviar mensajes.
    - [x] Crear un `Observable` para recibir mensajes en tiempo real.

- [x] **6. Componente de Chat:**
    - [x] Generar un nuevo componente de chat.
    - [x] Diseñar la interfaz de usuario para mostrar mensajes y un campo de entrada.
    - [x] Integrar el `ChatService` para la comunicación.

- [x] **7. Integración del Componente:**
    - [x] Añadir un punto de acceso (ej: un botón) al componente de chat en las vistas de paciente y enfermera.
    - [x] Cargar el historial de chat al abrir el componente.