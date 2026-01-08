<template>
  <div>
    <!-- Main content -->
    <main>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu phiên bản...</p>
      </div>

      <!-- Home View: Show all games -->
      <div v-else-if="currentView === 'home'" class="h-full version-page">

        <GameColumn
          :game="'GI'"
          :color="GAME_CFG.genshin.color"
          :title="GAME_CFG.genshin.name"
          :subtitle="GAME_CFG.genshin.subtitle"
          :versions="visibleVersionData.GI || []"
          @edit="handleEditVersion"
          @delete="handleDeleteVersion"
        />

        <GameColumn
          :game="'HSR'"
          :color="GAME_CFG.hsr.color"
          :title="GAME_CFG.hsr.name"
          :subtitle="GAME_CFG.hsr.subtitle"
          :versions="visibleVersionData.HSR || []"
          @edit="handleEditVersion"
          @delete="handleDeleteVersion"
        />

        <GameColumn
          :game="'ZZZ'"
          :color="GAME_CFG.zzz.color"
          :title="GAME_CFG.zzz.name"
          :subtitle="GAME_CFG.zzz.subtitle"
          :versions="visibleVersionData.ZZZ || []"
          @edit="handleEditVersion"
          @delete="handleDeleteVersion"
        />
      </div>

      <div v-else-if="currentView === 'game' && selectedGame" >
        <v-tabs v-model="activeTab" background-color="transparent" grow>
          <v-tab value="versions">Versions</v-tab>
        </v-tabs>

        <div class="page-header">
          <div>
            <h1 class="page-title">{{ GAME_CFG[selectedGameType].name }} - {{ activeTab === 'versions' ? 'Game Versions' : 'Character Builds' }}</h1>
            <p class="page-subtitle">{{ activeTab === 'versions' ? 'Track updates and releases' : 'Manage your character configurations' }}</p>
          </div>
          <div class="page-actions">
            <v-btn
              variant="text"
              prepend-icon="mdi-arrow-left"
              @click="currentView = 'home'; selectedGame = null; router.push('/versions')"
            >
              Back to All
            </v-btn>
            <v-btn
              variant="text"
              prepend-icon="mdi-home"
              to="/"
            >
              Home
            </v-btn>
            <v-btn
              variant="text"
              prepend-icon="mdi-account-group"
              to="/characters"
            >
              Characters
            </v-btn>
          </div>
        </div>

        <div class="game-toolbar">
          <div class="toolbar-actions">
            <v-btn
              v-if="ENABLE_CRUD && activeTab === 'versions'"
              color="primary"
              @click="handleAddVersion"
              class="ml-2"
            >
              + Thêm Version
            </v-btn>
          </div>
        </div>

        <div v-if="activeTab === 'versions'" class="game-grid-versions">
          <div v-for="v in sortedGameVersions" :key="v._id || v.id">
            <VersionCard 
              :version="v" 
              :color="GAME_CFG[selectedGameType].color"
              @edit="handleEditVersion"
              @delete="handleDeleteVersion"
            />
          </div>
        <div
          v-if="(sortedGameVersions || []).length === 0"
          class="version-card version-card--empty"
        >
          <p>No versions available</p>
        </div>
        </div>

          <div v-else class="builds-section" />
      </div>
    </main>

    <!-- Version Modal for CRUD -->
    <VersionModal
      v-if="ENABLE_CRUD"
      :visible="showVersionModal"
      :model="editingVersion"
      @save="handleSaveVersion"
      @close="handleCloseModal"
    />

    <!-- Conflict Resolution Dialog -->
    <ConflictResolutionDialog
      v-if="ENABLE_CRUD"
      v-model="showConflictDialog"
      :diff="diff"
      @resolve="handleConflictResolve"
      @cancel="handleCancelConflict"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameColumn from '../../components/game/GameColumn.vue'
import VersionCard from '../../components/version/VersionCard.vue'
import VersionModal from '../../components/version/VersionModal.vue'
import { useVersionPage, useImagePreloader, useNotifications, useConflictResolution } from '../../composables'
import { GAMES as GAME_CFG } from '../../config/games'
import { ENABLE_CRUD, getSafeErrorMessage } from '../../utils/common'
import ConflictResolutionDialog from '../../components/common/ConflictResolutionDialog.vue'

const route = useRoute()
const router = useRouter()

const {
  currentView,
  selectedGame,
  selectedGameType,
  activeTab,
  visibleVersionData,
  sortedGameVersions,
  loading,
  createVersion,
  updateVersion,
  deleteVersion,
  versionData,
  fetchVersions
} = useVersionPage()

// Image preloader
const { preloadImagesFromSelector } = useImagePreloader()

// Watch loading để preload images sau khi data load xong
watch(loading, async (isLoading) => {
  if (!isLoading) {
    // Đợi DOM update
    await nextTick()
    // Preload images trong version cards
    try {
      await preloadImagesFromSelector(
        '.version-card img, .rateup-avatar img',
        { timeout: 30000, continueOnError: true }
      )
    } catch (err) {
      console.warn('Error preloading version images:', err)
    }
  }
})

// CRUD state
const showVersionModal = ref(false)
const editingVersion = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)
const showConflictDialog = ref(false)

// Handle query params for editing version
onMounted(() => {
  const id = route.query.id as string
  if (id && ENABLE_CRUD) {
    // Find version by ID in all games
    for (const game of ['GI', 'HSR', 'ZZZ'] as const) {
      const version = versionData.value[game]?.find((v: any) => (v._id || v.id) === id)
      if (version) {
        editingVersion.value = version
        showVersionModal.value = true
        // Remove query param after setting up edit
        router.replace({ query: { ...route.query, id: undefined } })
        break
      }
    }
  }
})

const { success, error: showError } = useNotifications()

// Conflict resolution
const {
  diff,
  handleConflict,
  resolveConflict,
  clearConflict
} = useConflictResolution()

const handleAddVersion = () => {
  if (ENABLE_CRUD) {
    editingVersion.value = null
    showVersionModal.value = true
  }
}

const handleEditVersion = (version: any) => {
  if (ENABLE_CRUD) {
    editingVersion.value = version
    showVersionModal.value = true
  }
}

const handleDeleteVersion = async (version: any) => {
  if (ENABLE_CRUD && !deleting.value) {
    if (confirm(`Bạn có chắc chắn muốn xóa phiên bản "${version.version}"? Hành động này không thể hoàn tác.`)) {
      deleting.value = true
      try {
        const id = version._id || version.id
        await deleteVersion(id)
        success(`Đã xóa phiên bản "${version.version}" thành công`)
      } catch (error: any) {
        const errorMsg = getSafeErrorMessage(error)
        showError(`Không thể xóa phiên bản: ${errorMsg}`)
        console.error('Failed to delete version:', error)
      } finally {
        deleting.value = false
      }
    }
  }
}

const handleSaveVersion = async (versionData: any) => {
  if (ENABLE_CRUD && !saving.value) {
    saving.value = true
    try {
      if (editingVersion.value) {
        // Update existing version
        const id = editingVersion.value._id || editingVersion.value.id
        await updateVersion(id, versionData)
        success(`Đã cập nhật phiên bản "${versionData.version || 'N/A'}" thành công`)
      } else {
        // Create new version
        await createVersion(versionData)
        success(`Đã tạo phiên bản "${versionData.version || 'N/A'}" thành công`)
      }
      showVersionModal.value = false
      editingVersion.value = null
    } catch (error: any) {
      // Handle conflict
      if (error.isConflict) {
        const conflictInfo = handleConflict(error, versionData)
        if (conflictInfo) {
          // Show conflict dialog
          showConflictDialog.value = true
          saving.value = false
          return
        }
      }
      
      const errorMsg = getSafeErrorMessage(error)
      showError(`Không thể lưu phiên bản: ${errorMsg}`)
      console.error('Failed to save version:', error)
    } finally {
      saving.value = false
    }
  }
}

const handleCancelConflict = () => {
  clearConflict()
  showConflictDialog.value = false
}

const handleConflictResolve = async (action: 'reload' | 'merge' | 'overwrite') => {
  const resolution = resolveConflict(action)
  showConflictDialog.value = false
  
  if (resolution === 'reload') {
    // Reload from server - refresh data and close modal
    await fetchVersions()
    showVersionModal.value = false
    editingVersion.value = null
    return
  }
  
  // Merge or overwrite - retry with merged data
  const versionDataToSave = editingVersion.value
  if (!versionDataToSave) return
  
  saving.value = true
  try {
    if (editingVersion.value) {
      const id = editingVersion.value._id || editingVersion.value.id
      await updateVersion(id, versionDataToSave)
      success(`Đã cập nhật phiên bản "${versionDataToSave.version || 'N/A'}" thành công`)
    } else {
      await createVersion(versionDataToSave)
      success(`Đã tạo phiên bản "${versionDataToSave.version || 'N/A'}" thành công`)
    }
    showVersionModal.value = false
    editingVersion.value = null
  } catch (error: any) {
    const errorMsg = getSafeErrorMessage(error)
    showError(`Không thể lưu phiên bản: ${errorMsg}`)
    console.error('Failed to save after conflict resolution:', error)
  } finally {
    saving.value = false
  }
}

const handleCloseModal = () => {
  showVersionModal.value = false
  editingVersion.value = null
}
</script>
