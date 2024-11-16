<template>
    <div>
        Hello World CMMV
    </div>
</template>

<style scoped></style>
  
<script setup lang="ts">
import CmmvMixins from "http://localhost:3000/assets/rpc-mixins.js";

defineOptions({
    mixins: [CmmvMixins],
});
</script>