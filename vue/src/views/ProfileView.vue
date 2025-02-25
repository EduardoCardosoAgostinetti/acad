<template>
    <main>
        <div class="profile-container">
            <div class="profile-content">
                <div class="profile-image-container">
                    <img v-if="profilePicture" :src="'http://localhost:3000/uploads/profilePictures/' + profilePicture"
                        alt="Foto de Perfil" class="profile-image" @click="triggerProfileImageUpload" />
                    <img v-if="!profilePicture" :src="defaultProfilePicture" alt="Foto de Perfil" class="profile-image"
                        @click="triggerProfileImageUpload" />
                    <input type="file" ref="profileImageInput" @change="handleProfilePictureUpload" accept="image/*"
                        style="display: none;" />
                </div>

                <div class="profile-info">
                    <p v-if="user.name" class="profile-name">{{ user.name }}</p>
                    <p v-if="user.email" class="profile-email">{{ user.email }}</p>
                    <p v-if="user.username" class="profile-email">{{ user.username }}</p>
                    <p v-if="user.birthdate" class="profile-detail">{{ calculateAge(user.birthdate) }} years</p>
                    <p v-if="user.height" class="profile-detail">{{ user.height }} cm</p>
                    <p v-if="user.weight" class="profile-detail">{{ user.weight }} kg</p>

                </div>
            </div>
        </div>

        <div class="upload-container">
            <div class="upload-section">
                <h2>Add Progress Photos</h2>
                <p>Share your progress with new photos. The images will appear in the gallery below.</p>
                <div class="upload-action-group">
                    <input type="file" @change="handlePhotoUpload" accept="image/*" class="file-input upload-input" />
                    <div class="button-group">
                        <button @click="toggleEditMode" v-if="!isEditing" class="edit-gallery-btn">Editar
                            Galeria</button>
                        <button @click="toggleEditMode" v-if="isEditing"
                            class="edit-gallery-btn cancel-edit-btn">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="photo-gallery" v-if="userPhotos.length">
            <div class="gallery-grid">
                <div v-for="(photo, index) in userPhotos" :key="index" class="gallery-photo-container">
                    <img :src="'http://localhost:3000/uploads/gallery/' + photo.fileName" class="gallery-photo"
                        @click="expandPhoto('http://localhost:3000/uploads/gallery/' + photo.fileName)" />
                    <button v-if="isEditing" @click="deletePhoto(photo.fileName)" class="delete-photo-btn">
                        <span class="delete-icon">X</span>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="expandedPhoto" class="photo-modal" @click="expandedPhoto = null">
            <img :src="expandedPhoto" class="expanded-photo" />
        </div>
    </main>
</template>

<script>
import { jwtDecode } from "jwt-decode";

export default {
    name: "UserProfile",
    data() {
        return {
            user: {},
            editedUser: {},
            isEditing: false,
            userPhotos: [],
            expandedPhoto: null,
            profilePicture: null,
            defaultProfilePicture:
                "https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg",
        };
    },
    methods: {
        toggleEditMode() {
            this.isEditing = !this.isEditing;
        },

        triggerProfileImageUpload() {
            this.$refs.profileImageInput.click();
        },

        async deletePhoto(fileName) {
            try {
                const response = await fetch(`http://localhost:3000/ftp/galleryPicture/${this.user.id}/${fileName}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    this.userPhotos = this.userPhotos.filter(photo => photo.fileName !== fileName);
                    console.log('Imagem removida com sucesso!');
                } else {
                    const errorData = await response.json();
                    console.error('Erro ao remover a imagem:', errorData.message);
                }
            } catch (error) {
                console.error('Erro ao remover a imagem:', error);
            }
        },


        async handleProfilePictureUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.editedUser.profilePicture = e.target.result;
                };
                reader.readAsDataURL(file);
                await this.uploadProfilePictureToFTP(file);
            }
        },

        async uploadProfilePictureToFTP(file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', this.user.id);

            try {
                const response = await fetch('http://localhost:3000/ftp/profilePicture', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    this.editedUser.profilePicture = result.filePath;
                    this.fetchProfilePicture();
                } else {
                    console.error('Erro ao enviar a imagem de perfil:', response.statusText);
                }
            } catch (error) {
                console.error('Erro ao enviar a imagem de perfil:', error);
            }
        },

        async handlePhotoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', this.user.id);

                try {
                    const response = await fetch('http://localhost:3000/ftp/galleryPicture', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const result = await response.json();
                        this.userPhotos.push(result.fileName);
                        this.fetchProgressPhotos();
                    } else {
                        console.error('Erro ao enviar foto de progresso:', response.statusText);
                    }
                } catch (error) {
                    console.error('Erro ao enviar foto de progresso:', error);
                }
            }
        },

        async fetchProgressPhotos() {
            try {
                const response = await fetch(`http://localhost:3000/ftp/galleryPicture/${this.user.id}`, {
                    method: 'GET',
                });
                if (response.ok) {
                    const result = await response.json();
                    this.userPhotos = result || [];
                } else {
                    console.error('Erro ao buscar fotos de progresso:', response.statusText);
                }
            } catch (error) {
                console.error('Erro ao buscar fotos de progresso:', error);
            }
        },

        expandPhoto(photo) {
            this.expandedPhoto = photo;
        },

        loadUserFromToken() {
            const token = sessionStorage.getItem("token");
            if (token) {
                const payload = jwtDecode(token);
                this.user = {
                    id: payload.id || "",
                    name: payload.name || "",
                    email: payload.email || "",
                    birthdate: payload.birthdate || null,
                    height: payload.height || null,
                    weight: payload.weight || null,
                    username: payload.username || null,
                };
                this.editedUser = { ...this.user };
            }
        },

        calculateAge(birthdate) {
            if (!birthdate) return null;
            const birthDateObj = new Date(birthdate);
            const today = new Date();
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const monthDiff = today.getMonth() - birthDateObj.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
                age--;
            }
            return age;
        },

        async fetchProfilePicture() {
            try {
                const response = await fetch(`http://localhost:3000/ftp/profilePicture/${this.user.id}`, {
                    method: 'GET',
                });
                if (response.ok) {
                    const result = await response.json();
                    this.profilePicture = result.fileName || this.defaultProfilePicture;
                } else {
                    console.error('Erro ao buscar a imagem de perfil:', response.statusText);
                }
            } catch (error) {
                console.error('Erro ao buscar a imagem de perfil:', error);
            }
        },
    },

    mounted() {
        this.loadUserFromToken();
        this.fetchProfilePicture();
        this.fetchProgressPhotos();
    },
};
</script>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 90vh;
    padding: 6rem 0;
}

.profile-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
    background-color: white;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
}

.profile-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: center;
}

.profile-info {
    text-align: center;
}

@media (min-width: 768px) {
    .profile-content {
        flex-direction: row;
    }

    .profile-info {
        flex: 1;
        text-align: left;
    }
}

.profile-image-container {
    position: relative;
}

.profile-image {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.profile-image:hover {
    transform: scale(1.05);
}

.profile-name {
    font-size: 1.125rem;
    font-weight: 600;
}

.profile-email {
    color: #718096;
}

.profile-detail {
    margin-top: 8px;
    font-size: 1rem;
}

.edit-button {
    margin-top: 16px;
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.edit-button:hover {
    background-color: #45a049;
}

.file-input {
    display: block;
    TEXT-ALIGN-LAST: CENTER;
}

.upload-container {
    max-width: 800px;
    margin-top: 32px;
    padding: 24px;
    background-color: #f9f9f9;
    border-radius: 16px;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
    text-align: center;
}

.upload-section h2 {
    font-size: 1.5rem;
    margin-bottom: 8px;
}

.upload-section p {
    color: #555;
    margin-bottom: 16px;
}

/* Agrupar o input e os botões em uma linha */
.upload-action-group {
    flex-direction: column;
    PLACE-SELF: CENTER;
    display: flex;
    justify-content: center;
    gap: 16px;
    align-items: center;
    margin-top: 16px;
}

/* Estilo para o input de arquivo */
.upload-input {
    padding: 10px;
    background-color: rgb(221 221 221);
    border-radius: 8px;
    border: 1px solid #ddd;
}

/* Estilos para o grupo de botões */
.button-group {
    display: flex;
    gap: 16px;
}

.edit-gallery-btn, .cancel-edit-btn {
    padding: 10px 20px;
    background-color: rgb(221 221 221);
    color: rgb(0, 0, 0);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.cancel-edit-btn {
    background-color: #ff4d4f;
}

.edit-gallery-btn:hover, .cancel-edit-btn:hover {
    background-color: #45a049;
}

.photo-gallery {
    width: 100%;
    max-width: 800px;
    margin: 24px auto;
}

.photo-gallery h2 {
    font-size: 1.5rem;
    margin-bottom: 16px;
    text-align: center;
}

.gallery-grid {
    text-align: center;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
}

.gallery-photo {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s ease;
}

.gallery-photo-container {
    position: relative;
    display: inline-block;
}

.gallery-photo:hover {
    transform: scale(1.05);
}

.photo-modal {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.expanded-photo {
    max-width: 90%;
    max-height: 90%;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.delete-photo-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 5px;
    background-color: rgb(255 255 255 / 0%);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    color: red;
}
</style>