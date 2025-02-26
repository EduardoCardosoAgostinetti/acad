<template>
    <main>
        <div class="container-main">
            <div class="profile-container">
                <div class="profile-content">
                    <div class="profile-image-container">
                        <img v-if="profilePicture"
                            :src="'http://localhost:3000/uploads/profilePictures/' + profilePicture"
                            alt="Foto de Perfil" class="profile-image" @click="triggerProfileImageUpload" />
                        <img v-else :src="defaultProfilePicture" alt="Foto de Perfil"
                            class="profile-image" @click="triggerProfileImageUpload" />
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
            profilePicture: null,
            defaultProfilePicture:"default.jpg",
        };
    },
    methods: {
        triggerProfileImageUpload() {
            this.$refs.profileImageInput.click();
        },

        async handleProfilePictureUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', this.user.id);

                try {
                    const response = await fetch('http://localhost:3000/upload/profilePicture', {
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
                }
            }
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
                const response = await fetch(`http://localhost:3000/upload/profilePicture/${this.user.id}`, {
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
            }
        },
    },

    mounted() {
        this.loadUserFromToken();
        this.fetchProfilePicture();
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
.container-main {
    width: 80%;
    align-items: center;
    flex-direction: column;
    display: flex;
}
.profile-container {
    width: 100%;
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
</style>
