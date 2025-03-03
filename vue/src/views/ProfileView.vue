<template>
    <LoadingComponent :loading="isLoading"/>
    <main>
        <div class="container-main">
            <div class="profile-container">
                <div class="profile-content">
                    <div class="profile-image-container">
                        <img v-if="profilePicture" :src="config.apiUrl + '/uploads/profilePictures/' + profilePicture"
                            alt="Foto de Perfil" class="profile-image" @click="triggerProfileImageUpload" />
                        <img v-else :src="config.apiUrl + '/uploads/profilePictures/' + defaultProfilePicture"
                            alt="Foto de Perfil" class="profile-image" @click="triggerProfileImageUpload" />
                        <input type="file" ref="profileImageInput" @change="handleProfilePictureUpload" accept="image/*"
                            style="display: none;" />
                    </div>

                    <div class="profile-info">
                        <p v-if="user.name" class="profile-name">{{ user.name }}</p>
                        <p v-if="user.email" class="profile-email">{{ user.email }}</p>
                        <p v-if="user.username" class="profile-email">{{ user.username }}</p>
                    </div>
                </div>
            </div>

            <div class="gallery-menu">
                <button v-for="gallery in galleries" :key="gallery.id" @click="activeGallery = gallery.id"
                    :class="{ active: activeGallery === gallery.id }">
                    {{ gallery.name }}
                </button>

            </div>
            <input type="file" @change="handleGalleryUpload" />
            <button @click="toggleEditMode" class="edit-gallery-btn">
                {{ isEditing ? "Finish" : "Delete Image" }}
            </button>
            <div class="gallery-container">
                <div class="gallery-grid">
                    <div v-for="image in galleryImages[activeGallery]" :key="image.imageId" class="gallery-item">
                        <div class="image-info">
                            <!-- Exibindo a data de criação -->
                            <p class="image-date">{{ new Date(image.createdAt).toLocaleDateString() }}</p>
                        </div>
                        <img :src="`${config.apiUrl}` + image.filePath" alt="Gallery Image" @click="openModal(image)" />
                        <button v-if="isEditing" @click="deleteImage(image)" class="delete-btn">X</button>
                    </div>
                </div>

            </div>

            <!-- Modal para exibir imagem expandida -->
            <div v-if="isModalOpen" class="modal" @click="closeModal">
                <div class="modal-content" @click.stop>

                    <img :src="config.apiUrl + modalImage.filePath" alt="Expanded Image" />
                </div>
            </div>

        </div>
    </main>
</template>

<script>
import { config } from '@/js/auth.js';
import { jwtDecode } from "jwt-decode";
import LoadingComponent from '@/components/LoadingComponent.vue';

export default {
    name: "UserProfile",
    components: {
        LoadingComponent,
    },
    data() {
        return {
            isLoading: false,
            config,
            isModalOpen: false,
            modalImage: null,
            isEditing: false,
            activeGallery: '1',
            galleries: [
                { id: '1', name: 'Arm' },
                { id: '2', name: 'Chest' },
                { id: '3', name: 'Coast' },
                { id: '4', name: 'Abdomen' },
                { id: '5', name: 'Quadriceps' },
                { id: '6', name: 'Glutes' },
                { id: '7', name: 'Calves' },
            ],
            galleryImages: {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
                6: [],
                7: [],
            },
            user: {},
            profilePicture: null,
            defaultProfilePicture: 'default.jpg',
        };
    },
    methods: {

        toggleEditMode() {
            this.isEditing = !this.isEditing;
        },

        async deleteImage(image) {
            this.isLoading = true;
            const confirmed = confirm("Are you sure you want to delete this image?");
            if (!confirmed) return;  // Se o usuário não confirmar, cancela a exclusão

            try {
                const response = await fetch(`${config.apiUrl}/upload/gallery/${image.imageId}`, {
                    method: 'DELETE',
                });

                const result = await response.json();
                console.log(result);
                if (result.success) {
                    // Remove a imagem da galeria atual
                    this.galleryImages[this.activeGallery] = this.galleryImages[this.activeGallery].filter(img => img !== image);
                } else {
                    console.error('Erro ao excluir imagem:', result.message);
                }
            } catch (error) {
                console.error('Erro ao excluir imagem:', error);
            } finally {
                this.isLoading = false;
            }
        },



        openModal(image) {
            this.modalImage = image;
            this.isModalOpen = true;
        },

        // Método para fechar o modal
        closeModal() {
            this.isModalOpen = false;
            this.modalImage = null;
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
                    username: payload.username || null,
                };
            }
        },

        triggerProfileImageUpload() {
            this.$refs.profileImageInput.click();
        },

        async handleProfilePictureUpload(event) {
            this.isLoading = true;
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', this.user.id);

                try {
                    const response = await fetch(`${config.apiUrl}/upload/profilePicture`, {
                        method: 'POST',
                        body: formData,
                    });
                    const result = await response.json();
                    if (result.success) {

                        this.profilePicture = result.fileName;
                    } else {
                        console.error(result.message);
                    }
                } catch (error) {
                    console.error('Erro ao enviar a imagem de perfil:', error);
                }finally{
                    this.isLoading = false;
                }
            }
        },

        async fetchProfilePicture() {
            this.isLoading = true;
            try {
                const response = await fetch(`${config.apiUrl}/upload/profilePicture/${this.user.id}`, {
                    method: 'GET',
                });
                const result = await response.json();
                if (result.success) {
                    this.profilePicture = result.fileName;
                } else {
                    console.error(result.message);
                    this.profilePicture = this.defaultProfilePicture;
                }
            } catch (error) {
                console.error('Erro ao buscar a imagem de perfil:', error);
            }finally{
                this.isLoading = false;
            }
        },

        async handleGalleryUpload(event) {
            this.isLoading = true;
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', this.user.id); // Garante que o userId é enviado corretamente

            try {
                const response = await fetch(`${config.apiUrl}/upload/gallery/${this.activeGallery}`, {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                console.log(result);


                if (result.success) {
                    this.galleryImages[this.activeGallery].push({
                        filePath: result.filePath,
                        imageId: result.imageId
                    });
                    event.target.value = '';
                    this.fetchGalleryImages();
                } else {
                    console.error('Erro no upload:', result.message);
                }
            } catch (error) {
                console.error('Erro ao fazer upload da imagem da galeria:', error);
            }finally{
                this.isLoading = false;
            }
        },

        async fetchGalleryImages() {
            this.isLoading = true;
            try {
                const response = await fetch(`${config.apiUrl}/upload/gallery/${this.user.id}`, {
                    method: 'GET',
                });

                const result = await response.json();
                console.log(result);
                if (result.success) {
                    // Resetando as galerias antes de preencher com os novos dados
                    this.galleries.forEach(gallery => {
                        this.galleryImages[gallery.id] = [];
                    });

                    // Preenchendo cada galeria com as imagens recebidas
                    result.images.forEach(image => {
                        if (this.galleryImages[image.galleryId]) {
                            // Adicionando a data de criação para cada imagem
                            this.galleryImages[image.galleryId].push({
                                filePath: image.filePath,
                                imageId: image.imageId,
                                createdAt: image.createdAt // Supondo que createdAt seja retornado
                            });
                        }
                    });

                    // Ordenando as imagens por createdAt em ordem decrescente (mais recentes primeiro)
                    this.galleries.forEach(gallery => {
                        this.galleryImages[gallery.id].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    });

                } else {
                    console.error('Erro ao buscar imagens das galerias:', result.message);
                }
            } catch (error) {
                console.error('Erro ao carregar imagens das galerias:', error);
            }finally{
                this.isLoading = false;
            }
        },



    },
    created() {
        const token = sessionStorage.getItem("token");

        if (!token) {
            this.$router.push('/signin');
            return;
        }

        this.loadUserFromToken();
        this.fetchProfilePicture();
        this.fetchGalleryImages();
    },

};
</script>

<style scoped>
.edit-gallery-btn {
    margin: 10px;
    padding: 10px 15px;
    background-color: rgb(100, 58, 167);
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

.delete-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    padding: 5px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 50%;
}

.delete-btn:hover {
    background: darkred;
}

.edit-gallery-btn:hover {
    background-color: rgb(80, 40, 140);
}

main {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 90vh;
    padding: 6rem 0;
}

.container-main {
    width: 80%;
    align-items: center;
    flex-direction: column;
    display: flex;
}

.profile-container {
    width: 100%;
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

    .profile-image[data-v-0e7a7305] {
        width: 160px;
        height: 160px;
    }
}

.profile-image-container {
    position: relative;
}

.profile-image {
    width: 100px;
    height: 100px;
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

.gallery-menu {
    width: 100%;
    display: flex;
    margin: 1rem;
    flex-direction: column;
    justify-content: space-between;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
    .gallery-menu {
        flex-direction: row;
    }
}

.gallery-menu button {
    width: 100%;
    background-color: transparent;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: #495057;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.gallery-menu button:hover {
    background-color: rgb(100, 58, 167);
    color: white;
}

.gallery-menu button.active {
    background-color: rgb(100, 58, 167);
    color: white;
    border: 2px solid rgb(100, 58, 167);
    font-weight: bold;
}

.gallery-container {
    width: 100%;
    width: 100%;
    max-width: 1200px;
    /* Limitar largura máxima do container */
    margin: 0 auto;

}

.gallery-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
}

.gallery-item {

    width: 100%;
    /* Itens ocupando toda a largura da grid */
    height: 200px;
    position: relative;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

/* Ajuste para dispositivos móveis e telas menores */
@media (max-width: 768px) {
    .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        /* Para telas menores, as colunas podem ser de 100px */
    }

    .gallery-item {
        width: 100%;
        height: 100px;
        /* Reduz a altura nas telas menores */
    }
}

.gallery-item:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    transition: transform 0.3s ease;
}

.image-info {
    position: absolute;
    bottom: 6px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.9em;
}

.image-date {
    margin: 0;
    font-size: 0.9em;
    font-weight: bold;
}

.gallery-item:hover img {
    transform: scale(1.1);
}

input[type="file"] {
    display: block;
    margin: 0.5rem;
    cursor: pointer;
    background-color: rgb(100, 58, 167);
    color: white;
    border: none;
    padding: 10px;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}

input[type="file"]:hover {
    background-color: rgb(100, 58, 167);
}

/* Estilos para o modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    max-width: 90%;
    max-height: 90%;
    padding: 10px;
    background-color: white;
    border-radius: 10px;
}

.modal-content img {
    width: 100%;
    height: auto;
    object-fit: contain;
}
</style>
