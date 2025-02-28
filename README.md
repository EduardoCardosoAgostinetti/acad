
# API de Gerenciamento de Conta e Exercícios

Esta é uma API de gerenciamento de conta e exercícios, com funcionalidades como login, recuperação de senha, upload de fotos de perfil e galeria, e criação de folhas de treino para musculação.

## Endpoints

### 1. **Login**
- **URL:** `/signin`  
- **Método:** `POST`  
- **Corpo da requisição:**
  ```json
  {
    "username": "rjnhxf",
    "password": "123456"
  }
  ```
- **Descrição:** Realiza o login do usuário com o nome de usuário e senha fornecidos.

---

### 2. **Esqueci a senha**
- **URL:** `/forgotPassword`  
- **Método:** `POST`  
- **Corpo da requisição:**
  ```json
  {
    "email": "eduardo.c.01@hotmail.com"
  }
  ```
- **Descrição:** Envia um código de redefinição de senha para o e-mail fornecido.

---

### 3. **Redefinir senha**
- **URL:** `/forgotPassword/resetPassword`  
- **Método:** `POST`  
- **Corpo da requisição:**
  ```json
  {
    "email": "eduardo.c.01@hotmail.com",
    "resetCode": "147881901",
    "password": "1234567",
    "confirmPassword": "1234567"
  }
  ```
- **Descrição:** Permite redefinir a senha do usuário com o código de redefinição recebido por e-mail.

---

### 4. **Cadastro de usuário**
- **URL:** `/signup`  
- **Método:** `POST`  
- **Corpo da requisição:**
  ```json
  {
    "name": "Eduardo Cardoso Agostinetti",
    "email": "eduardo.c.01@hotmail.com",
    "username": "1",
    "password": "1",
    "confirmPassword": "1",
    "birthdate": "1990-01-01"
  }
  ```
- **Descrição:** Cria uma nova conta de usuário com os dados fornecidos.

---

### 5. **Upload de foto de perfil**
- **URL:** `/upload/profilePicture`  
- **Método:** `POST`  
- **Form-data:**
  - `file`: Arquivo da foto de perfil (tipo `file`)
  - `userId`: ID do usuário (tipo `integer`)

- **Descrição:** Realiza o upload de uma foto de perfil para o usuário.

---

### 6. **Obter foto de perfil**
- **URL:** `/upload/profilePicture/:userId`  
- **Método:** `GET`  
- **Descrição:** Retorna a foto de perfil do usuário com o `userId` especificado.

---

### 7. **Upload de imagem para galeria**
- **URL:** `/upload/gallery/:galleryId`  
- **Método:** `POST`  
- **Form-data:**
  - `file`: Arquivo da imagem (tipo `file`)
  - `userId`: ID do usuário (tipo `integer`)

- **Descrição:** Realiza o upload de uma imagem para a galeria especificada.

---

### 8. **Obter imagens da galeria**
- **URL:** `/upload/gallery/:galleryId`  
- **Método:** `GET`  
- **Descrição:** Retorna todas as imagens da galeria especificada.

---

### 9. **Excluir imagem da galeria**
- **URL:** `/upload/gallery/:imageId`  
- **Método:** `DELETE`  
- **Descrição:** Exclui a imagem da galeria com o `imageId` especificado.

---

### 10. **Criar ficha de treino**
- **URL:** `/exercise/workout_sheet`  
- **Método:** `POST`  
- **Corpo da requisição:**
  ```json
  {
    "muscleGroup": "Peito",
    "exercises": [
      { "name": "Supino Reto", "sets": 4, "series": [12, 10, 8, 6] },
      { "name": "Crucifixo", "sets": 3, "series": [15, 12, 10] }
    ],
    "userID": 1
  }
  ```
- **Descrição:** Cria uma ficha de treino para o usuário, especificando o grupo muscular, os exercícios e as séries.

---

### 11. **Obter fichas de treino de um usuário**
- **URL:** `/exercise/workout_sheets/:userId`  
- **Método:** `GET`  
- **Descrição:** Retorna todas as fichas de treino de um usuário, identificado pelo `userId`.

---

## Tecnologias Usadas
- **Node.js** para o backend.
- **Express** para criação das rotas.
- **Multer** para upload de arquivos.
- **PostgreSQL** para armazenamento de dados.
- **Sequelize** para configuracao do banco de dados.
- **JWT** para seguranca de dados.
- **bcrypt** para criptografia de dados.

