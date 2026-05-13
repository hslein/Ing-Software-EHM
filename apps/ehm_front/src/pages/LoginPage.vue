<template>
  <div class="login-container">
    <div class="login-box">
      <h1>EHM Vehicles</h1>
      <p class="subtitle">Vehicle Management System</p>

      <div v-if="isLogin" class="form-section">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" v-model="email" type="email" placeholder="your@email.com" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" v-model="password" type="password" placeholder="********" required />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <p class="toggle-form">
            Don't have an account?
            <button type="button" @click="toggleForm">Register</button>
          </p>
        </form>
      </div>

      <div v-else class="form-section">
        <h2>Register</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="reg-email">Email</label>
            <input id="reg-email" v-model="email" type="email" placeholder="your@email.com" required />
          </div>

          <div class="form-group">
            <label for="reg-password">Password</label>
            <input
              id="reg-password"
              v-model="password"
              type="password"
              placeholder="********"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              placeholder="********"
              required
              minlength="6"
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <p class="toggle-form">
            Already have an account?
            <button type="button" @click="toggleForm">Login</button>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { login, register, loading } = useAuth();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref<string | null>(null);

const toggleForm = () => {
  isLogin.value = !isLogin.value;
  error.value = null;
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
};

const handleLogin = async () => {
  error.value = null;
  try {
    await login(email.value, password.value);
    router.push('/');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Login failed';
  }
};

const handleRegister = async () => {
  error.value = null;

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }

  try {
    await register(email.value, password.value);
    router.push('/');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Registration failed';
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 24px;
}

.login-box {
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

h1 {
  margin: 0 0 5px;
  color: #333;
  text-align: center;
  font-size: 28px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 30px;
  font-size: 14px;
}

.form-section {
  width: 100%;
}

h2 {
  color: #667eea;
  margin-bottom: 20px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-submit {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 20px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 10px 12px;
  border-radius: 5px;
  margin-top: 15px;
  font-size: 14px;
  border-left: 4px solid #c33;
}

.toggle-form {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.toggle-form button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.toggle-form button:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
