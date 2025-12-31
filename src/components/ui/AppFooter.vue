<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">VeriAsStat</h3>
        <p class="footer-desc">Track game versions and character builds across Genshin Impact, Honkai: Star Rail, and Zenless Zone Zero.</p>
      </div>
      
      <div class="footer-section">
        <h4 class="section-title">Games</h4>
        <ul class="footer-links">
          <li>
            <RouterLink to="/versions?game=GI" aria-label="Genshin Impact versions">
              Genshin Impact
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/versions?game=HSR" aria-label="Honkai Star Rail versions">
              Honkai: Star Rail
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/versions?game=ZZZ" aria-label="Zenless Zone Zero versions">
              Zenless Zone Zero
            </RouterLink>
          </li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4 class="section-title">Resources</h4>
        <ul class="footer-links">
          <li>
            <RouterLink to="/versions" aria-label="All versions">
              All Versions
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/characters" aria-label="All characters">
              All Characters
            </RouterLink>
          </li>
          <li>
            <a
              href="https://github.com/entering5824"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository (opens in new tab)"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p class="copyright">© 2025 VeriAsStat. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped src="../../assets/styles/components/AppFooter.css"></style>


