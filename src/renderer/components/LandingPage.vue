<template>
  <div id="wrapper">
    <main>
      <div class="left-side">
        <ClientsSearch></ClientsSearch>
      </div>

    </main>
  </div>
</template>

<script>
  import ClientsSearch from './Clients/ClientsSearch'
  export default {
    name: 'landing-page',
    components: {
      ClientsSearch
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
</style>
