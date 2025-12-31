<template>
  <div class="universal-upload">
    <label class="upload-label">
      <v-icon>{{ icon }}</v-icon>
      <span>{{ label }}</span>
      <v-chip 
        size="x-small" 
        :color="uploadService === 'firebase' ? 'orange' : 'primary'" 
        variant="outlined" 
        class="ml-2"
      >
        <v-icon start size="12">
          {{ uploadService === 'firebase' ? 'mdi-firebase' : 'mdi-cloud' }}
        </v-icon>
        {{ uploadService === 'firebase' ? 'Firebase' : 'Cloudinary' }}
      </v-chip>
      <span v-if="required" class="text-error ml-1">*</span>
    </label>
    
    <div 
      class="drop-zone" 
      :class="{ 
        'drop-zone-active': isDragging,
        'drop-zone-error': error 
      }"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <img v-if="previewUrl" :src="previewUrl" class="preview-img" alt="Preview" />
      
      <div v-else class="drop-placeholder">
        <v-icon 
          size="48" 
          :color="isDragging ? 'primary' : error ? 'error' : undefined"
        >
          {{ isDragging ? 'mdi-cloud-upload' : 'mdi-image-plus' }}
        </v-icon>
        <p>{{ isDragging ? 'Drop image here' : 'Click to select or drag & drop' }}</p>
        <small>{{ accept.toUpperCase().replace('IMAGE/', '').split(',').join(', ') }} (Max {{ maxSizeMB }}MB)</small>
      </div>
      
      <!-- Upload Progress -->
      <div v-if="uploading" class="upload-overlay">
        <v-progress-circular
          indeterminate
          size="48"
          color="primary"
        />
        <p class="mt-2">Uploading to {{ uploadService === 'firebase' ? 'Firebase' : 'Cloudinary' }}...</p>
      </div>
    </div>
    
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      @change="handleFileChange"
      style="display: none"
    />
    
    <div class="upload-footer">
      <v-btn 
        v-if="previewUrl && !uploading" 
        size="small" 
        variant="text" 
        color="error" 
        @click.stop="clearFile"
        prepend-icon="mdi-close"
      >
        Clear
      </v-btn>
      
      <div v-if="error" class="text-error text-caption mt-2">
        {{ error }}
      </div>
      
      <div v-if="uploadedUrl" class="text-success text-caption mt-2">
        <v-icon size="14" class="mr-1">mdi-check-circle</v-icon>
        Uploaded to {{ uploadService === 'firebase' ? 'Firebase' : 'Cloudinary' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { api } from '../../utils/common'

interface Props {
  modelValue?: File | null
  label: string
  icon?: string
  accept?: string
  maxSizeMB?: number
  required?: boolean
  previewUrl?: string
  uploadedUrl?: string
  uploading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-image',
  accept: 'image/png,image/jpeg,image/jpg,image/webp',
  maxSizeMB: 10,
  required: false,
  uploading: false
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  'update:previewUrl': [url: string]
  'clear': []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploadService = ref<'firebase' | 'cloudinary'>('firebase')

// Check which upload service is being used
onMounted(async () => {
  try {
    const response: any = await api.get('/upload-info')
    uploadService.value = (response.data as { service?: 'firebase' | 'cloudinary' }).service || 'firebase'
  } catch (error) {
    console.error('Failed to get upload service info:', error)
  }
})

const triggerFileInput = () => {
  if (!props.uploading) {
    fileInput.value?.click()
  }
}

const validateFile = (file: File): string | null => {
  // Check file type
  const acceptedTypes = props.accept.split(',').map(t => t.trim())
  if (!acceptedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
    return `Invalid file type. Accepted: ${acceptedTypes.join(', ')}`
  }
  
  // Check file size
  const maxBytes = props.maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    return `File too large. Max size: ${props.maxSizeMB}MB`
  }
  
  return null
}

const handleFile = (file: File) => {
  const validationError = validateFile(file)
  if (validationError) {
    emit('update:modelValue', null)
    return
  }
  
  emit('update:modelValue', file)
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    emit('update:previewUrl', e.target?.result as string)
  }
  reader.readAsDataURL(file)
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    handleFile(file)
  }
}

const handleDragOver = () => {
  if (!props.uploading) {
    isDragging.value = true
  }
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (props.uploading) return
  
  const file = event.dataTransfer?.files[0]
  if (file) {
    handleFile(file)
  }
}

const clearFile = () => {
  emit('update:modelValue', null)
  emit('update:previewUrl', '')
  emit('clear')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Reset file input when preview is cleared externally
watch(() => props.previewUrl, (newVal) => {
  if (!newVal && fileInput.value) {
    fileInput.value.value = ''
  }
})
</script>

<style scoped>
.universal-upload {
  margin-bottom: 16px;
}

.upload-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 14px;
}

.drop-zone {
  width: 100%;
  height: 180px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
}

.drop-zone:hover {
  border-color: rgba(130, 119, 255, 0.8);
  background: rgba(130, 119, 255, 0.05);
}

.drop-zone-active {
  border-color: rgb(130, 119, 255);
  background: rgba(130, 119, 255, 0.15);
  border-style: solid;
  transform: scale(1.02);
}

.drop-zone-active .drop-placeholder {
  color: rgb(130, 119, 255);
}

.drop-zone-error {
  border-color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.05);
}

.drop-placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.drop-placeholder p {
  margin: 8px 0 4px;
  font-size: 14px;
}

.drop-placeholder small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.upload-footer {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>