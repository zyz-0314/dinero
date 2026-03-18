<template>
  <div id="app">
    <NavBar />
    <div class="page-frame">
      <router-view />
    </div>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'

export default {
  name: 'App',
  components: {
    NavBar
  },
  data() {
    return {

    }
  }
}
</script>

<style>
html, body {
    margin: 0;
    padding: 0;
    overflow-y: scroll;
}

#app {
    width: 100%;
    height: 100vh;
}

.page-frame {
    padding-bottom: 8vh;
    min-height: calc(100vh - 8vh);
}
</style>