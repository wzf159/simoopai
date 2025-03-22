<template>
    <div class="simoo-tools-bar">
        <!-- <div id="toolbar">
            <button class="ql-bold"></button>
            <button class="ql-italic"></button>
            <select class="ql-size">
                <option value="small"></option>
                <option selected></option>
                <option value="large"></option>
                <option value="huge"></option>
            </select>
            <select class="ql-color">
                <option value=""></option>
                <option value="red"></option>
                <option value="green"></option>
                <option value="blue"></option>
                <option value="orange"></option>
            </select>
            <select class="ql-background">
                <option value=""></option>
                <option value="red"></option>
                <option value="green"></option>
                <option value="blue"></option>
                <option value="orange"></option>
            </select>
            <button class="ql-script" value="sub"></button>
            <button class="ql-script" value="super"></button>
            <button class="ql-header" value="1"></button>
            <button class="ql-header" value="2"></button>
            <button class="ql-blockquote"></button>
            <button class="ql-list" value="ordered"></button>
            <button class="ql-list" value="bullet"></button>
            <button class="ql-indent" value="-1"></button>
            <button class="ql-indent" value="+1"></button>
            <button class="ql-link"></button>
            <button class="ql-image"></button>
            <button class="ql-video"></button>
            <button class="ql-formula"></button>
            <button class="ql-clean"></button>

        </div> -->

    </div>
</template>

<script lang="ts" setup>


</script>

<style scoped>
.simoo-tools-bar {
    position: absolute;
    left: 45%;
    top: 10px;
    display: flex;
    background-color: #ffffff;
    padding: 5px;

    #toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
    }
}

button {
    margin-right: 10px;
}
</style>