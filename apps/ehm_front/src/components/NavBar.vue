<template>
    <nav class="navbar">
        <div class="navbar-container">
            <div class="navbar-logo">
                <a href="/">🚗 CarSales</a>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="/" class="nav-link">Home</a>
                </li>
                <li class="nav-item">
                    <a href="/inventory" class="nav-link">Inventory</a>
                </li>
                <li class="nav-item">
                    <a href="/about" class="nav-link">About Us</a>
                </li>
                <li class="nav-item">
                    <a href="/contact" class="nav-link">Contact</a>
                </li>
                <li class="nav-item">
                    <label for="brand" class="nav-label">Brand</label>
                    <select id="brand" class="brand-select">
                        <option value="maibatsu">Maibatsu</option>
                        <option value="karin">Karin</option>
                        <option value="obey">Obey</option>
                        <option value="vapid">Vapid</option>
                        <option value="bravado">Bravado</option>
                    </select>
                </li>
                <li class="nav-item">
                    <a href="/login" class="nav-link nav-link-btn">Sign In</a>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'NavBar',
    data() {
        return {};
    },
};
</script>

<style scoped>
.navbar {
    background-color: #333;
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.navbar-logo a {
    font-size: 1.5rem;
    font-weight: bold;
    color: #fff;
    text-decoration: none;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-link {
    color: #fff;
    text-decoration: none;
    transition: color 0.3s;
}

.nav-link:hover {
    color: #ff6b6b;
}

.nav-link-btn {
    background-color: #ff6b6b;
    padding: 0.5rem 1rem;
    border-radius: 4px;
}

.nav-link-btn:hover {
    background-color: #ff5252;
    color: #fff;
}

.nav-label {
    color: #fff;
    margin-right: 0.5rem;
    font-size: 0.95rem;
}

.brand-select {
    background-color: #fff;
    color: #333;
    border: none;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
}
</style>