<template>
  <div id="app">
    <landing-page></landing-page>
  </div>
</template>

<script>
  import LandingPage from '@/components/LandingPage'

  export default {
    name: 'client-debt',
    components: {
      LandingPage
    }
  }
</script>

<style>
  .error {
    color: red
  }
</style>
