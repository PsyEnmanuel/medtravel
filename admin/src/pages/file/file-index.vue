<template>
    <UploadFileManager :ref_id="1" table="t_account" file_type="GENERAL" />
    <FileManager :refId="1" refKey="t_account" />
</template>

<script setup>
import FileManager from 'src/components/file/FileManager.vue';
import UploadFileManager from 'src/components/file/UploadFileManager.vue';

</script>