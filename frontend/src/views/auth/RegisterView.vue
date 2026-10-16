<template>
  <div class="auth-view">
    <h2>Crear una Cuenta</h2>
    <p class="subtitle">Regístrate para crear o financiar proyectos</p>

    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <label for="nombre">Nombre Completo</label>
        <input 
          type="text" 
          id="nombre" 
          v-model="nombre" 
          placeholder="Juan Pérez" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="email">Correo Electrónico</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          placeholder="nombre@ejemplo.com" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="••••••••" 
          required 
        />
      </div>

      <button type="submit" class="btn-submit" :disabled="cargando">
        {{ cargando ? 'Registrando...' : 'Registrarse' }}
      </button>
    </form>

    <p class="auth-footer">
      ¿Ya tienes una cuenta? 
      <router-link to="/auth/login">Inicia sesión</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const nombre = ref('');
const email = ref('');
const password = ref('');
const cargando = ref(false);

const handleRegister = () => {
  if (!nombre.value || !email.value || !password.value) return;

  cargando.value = true;

  // Simulación de registro
  setTimeout(() => {
    cargando.value = false;
    router.push('/dashboard/mis-campanas');
  }, 1000);
};
</script>

<style scoped>
.auth-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  font-size: 1.5rem;
  color: var(--color-secondary);
  text-align: center;
}

.subtitle {
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
  margin-top: -0.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

input {
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-submit {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-submit:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.auth-footer {
  font-size: 0.875rem;
  text-align: center;
  color: #64748b;
  margin-top: 0.5rem;
}

.auth-footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>