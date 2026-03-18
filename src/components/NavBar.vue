<template>
    <div class="navbar-container">
        <nav class="navbar">
            <ul>
                <li>
                    <router-link to="/details">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                            <line x1="9" y1="9" x2="9" y2="15"></line>
                            <line x1="15" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span>明细</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="/graphViews">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <span>图表</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="/moneyManagement">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                        <span>管理</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>我的</span>
                    </router-link>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script>
export default {
    name: 'NavBar'
}
</script>

<style>
.navbar-container {
    position: fixed;
    width: 100%;
    height: 8vh;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}
.navbar ul {
    display: flex;
    width: 100%;
    height: 100%;
    list-style-type: none;
    padding: 0;
    margin: 0;
    justify-content: space-around;
    align-items: center;
}
.navbar li {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
}
.navbar a {
    text-decoration: none;
    color: #999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 12px;
}
</style>