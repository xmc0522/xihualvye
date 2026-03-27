import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormRules } from 'element-plus'

export function useLogin() {
  const router = useRouter()
  const formRef = ref<HTMLElement>()
  const loading = ref(false)
  const showPassword = ref(false)
  const isTyping = ref(false)
  const isPasswordVisible = ref(false)

  // 角色和眼睛元素引用
  const purpleShape = ref<HTMLElement>()
  const blackShape = ref<HTMLElement>()
  const orangeShape = ref<HTMLElement>()
  const yellowShape = ref<HTMLElement>()

  const purpleEyes = ref<HTMLElement>()
  const blackEyes = ref<HTMLElement>()
  const orangeEyes = ref<HTMLElement>()
  const yellowEyes = ref<HTMLElement>()

  let typingTimer: number | null = null
  let lookingTimer: number | null = null
  const isLookingAtEachOther = ref(false)

  const form = reactive({
    username: '',
    password: '',
    rememberMe: false,
  })

  const rules: FormRules = {
    username: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
    password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
  }

  // 鼠标跟随效果
  function handleMouseMove(e: MouseEvent) {
    if (isPasswordVisible.value || isLookingAtEachOther.value) return
    
    const shapes = [
      { shape: purpleShape.value, eyes: purpleEyes.value },
      { shape: blackShape.value, eyes: blackEyes.value },
      { shape: orangeShape.value, eyes: orangeEyes.value },
      { shape: yellowShape.value, eyes: yellowEyes.value }
    ]
    
    shapes.forEach(({ shape, eyes }) => {
      if (!shape || !eyes) return
      
      const shapeRect = shape.getBoundingClientRect()
      const centerX = shapeRect.left + shapeRect.width / 2
      const centerY = shapeRect.top + shapeRect.height / 3
      
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      
      // 计算身体倾斜
      const bodySkew = Math.max(-6, Math.min(6, -dx / 120))
      shape.style.transform = `skewX(${bodySkew}deg)`
      
      // 计算眼睛位置
      const faceX = Math.max(-15, Math.min(15, dx / 20))
      const faceY = Math.max(-10, Math.min(10, dy / 30))
      eyes.style.transform = `translate(calc(-50% + ${faceX}px), ${faceY}px)`
      
      // 计算瞳孔位置
      const pupils = eyes.querySelectorAll('.pupil')
      pupils.forEach(pupil => {
        const pupilEl = pupil as HTMLElement
        const pupilRect = pupilEl.getBoundingClientRect()
        const pupilCenterX = pupilRect.left + pupilRect.width / 2
        const pupilCenterY = pupilRect.top + pupilRect.height / 2
        
        const pupilDx = e.clientX - pupilCenterX
        const pupilDy = e.clientY - pupilCenterY
        const angle = Math.atan2(pupilDy, pupilDx)
        const distance = Math.min(5, Math.hypot(pupilDx, pupilDy) / 50)
        
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        pupilEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
      })
    })
  }

  // 打字时的效果：角色互相对视
  function handleInput() {
    isTyping.value = true
    isLookingAtEachOther.value = true
    
    if (typingTimer) clearTimeout(typingTimer)
    if (lookingTimer) clearTimeout(lookingTimer)
    
    // 紫色和黑色角色互相对视
    if (purpleShape.value && blackShape.value && purpleEyes.value && blackEyes.value) {
      // 紫色向右倾斜、伸长、眼睛向右看
      purpleShape.value.style.transform = 'skewX(-12deg) translateX(40px)'
      purpleShape.value.style.height = '58vh'
      purpleEyes.value.style.transform = 'translate(calc(-50% + 10px), 25px)'
      
      const purplePupils = purpleEyes.value.querySelectorAll('.pupil')
      purplePupils.forEach(p => {
        (p as HTMLElement).style.transform = 'translate(calc(-50% + 3px), calc(-50% + 4px))'
      })
      
      // 黑色向右倾斜、眼睛向左上看
      blackShape.value.style.transform = 'skewX(-8deg)'
      blackEyes.value.style.transform = 'translate(calc(-50% - 5px), -5px)'
      
      const blackPupils = blackEyes.value.querySelectorAll('.pupil')
      blackPupils.forEach(p => {
        (p as HTMLElement).style.transform = 'translate(calc(-50% - 0px), calc(-50% - 4px))'
      })
    }
    
    lookingTimer = window.setTimeout(() => {
      isLookingAtEachOther.value = false
      // 恢复正常姿态
      if (purpleShape.value) {
        purpleShape.value.style.transform = ''
        purpleShape.value.style.height = '55vh'
      }
      if (purpleEyes.value) purpleEyes.value.style.transform = ''
      if (blackShape.value) blackShape.value.style.transform = ''
      if (blackEyes.value) blackEyes.value.style.transform = ''
    }, 800)
    
    typingTimer = window.setTimeout(() => {
      isTyping.value = false
    }, 500)
  }

  function handleInputFocus() {
    handleInput()
  }

  function handleInputBlur() {
    if (typingTimer) clearTimeout(typingTimer)
    if (lookingTimer) clearTimeout(lookingTimer)
    isTyping.value = false
    isLookingAtEachOther.value = false
    
    // 恢复正常
    if (purpleShape.value) {
      purpleShape.value.style.transform = ''
      purpleShape.value.style.height = '55vh'
    }
    if (purpleEyes.value) purpleEyes.value.style.transform = ''
    if (blackShape.value) blackShape.value.style.transform = ''
    if (blackEyes.value) blackEyes.value.style.transform = ''
  }

  // 显示密码时避开视线
  function togglePassword() {
    showPassword.value = !showPassword.value
    isPasswordVisible.value = showPassword.value
    
    if (isPasswordVisible.value) {
      // 所有角色向左看并倾斜
      const shapes = [
        { shape: purpleShape.value, eyes: purpleEyes.value },
        { shape: blackShape.value, eyes: blackEyes.value },
        { shape: orangeShape.value, eyes: orangeEyes.value },
        { shape: yellowShape.value, eyes: yellowEyes.value }
      ]
      
      shapes.forEach(({ shape, eyes }) => {
        if (shape) shape.style.transform = 'skewX(0deg)'
        if (!eyes) return
        
        eyes.style.transform = 'translate(calc(-50% - 20px), -10px)'
        const pupils = eyes.querySelectorAll('.pupil')
        pupils.forEach(p => {
          (p as HTMLElement).style.transform = 'translate(calc(-50% - 5px), calc(-50% - 4px))'
        })
      })
    } else {
      // 恢复正常
      const shapes = [
        { shape: purpleShape.value, eyes: purpleEyes.value },
        { shape: blackShape.value, eyes: blackEyes.value },
        { shape: orangeShape.value, eyes: orangeEyes.value },
        { shape: yellowShape.value, eyes: yellowEyes.value }
      ]
      
      shapes.forEach(({ shape, eyes }) => {
        if (shape) shape.style.transform = ''
        if (eyes) eyes.style.transform = ''
        if (!eyes) return
        
        const pupils = eyes.querySelectorAll('.pupil')
        pupils.forEach(p => {
          (p as HTMLElement).style.transform = ''
        })
      })
    }
  }

  // 页面加载时检查是否已登录和记住的密码
  onMounted(() => {
    const saved = localStorage.getItem('xhly_auth')
    if (saved) {
      try {
        const auth = JSON.parse(saved)
        // 如果有 loginTime 且在有效期内，说明是已登录状态，自动跳转
        if (auth.loginTime && Date.now() - auth.loginTime < 24 * 60 * 60 * 1000) {
          router.replace('/')
          return
        }
        // 否则只是记住密码，填充表单但不自动登录
        if (auth.rememberMe && auth.username && auth.password) {
          form.username = auth.username
          form.password = auth.password
          form.rememberMe = true
        }
      } catch {
        localStorage.removeItem('xhly_auth')
      }
    }
  })

  onUnmounted(() => {
    if (typingTimer) clearTimeout(typingTimer)
    if (lookingTimer) clearTimeout(lookingTimer)
  })

  async function handleLogin() {
    if (!formRef.value) return
    const valid = await (formRef.value as any).validate().catch(() => false)
    if (!valid) return

    loading.value = true

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      })
      const data = await res.json()

      if (data.code === 0) {
        localStorage.setItem(
          'xhly_auth',
          JSON.stringify({
            username: form.username,
            password: form.rememberMe ? form.password : '',
            rememberMe: form.rememberMe,
            loginTime: Date.now(),
          }),
        )
        ElMessage.success('登录成功')
        router.replace('/')
      } else {
        ElMessage.error(data.message || '账号或密码错误')
      }
    } catch {
      ElMessage.error('网络错误,请检查服务是否启动')
    } finally {
      loading.value = false
    }
  }

  return {
    formRef,
    loading,
    showPassword,
    form,
    rules,
    purpleShape,
    blackShape,
    orangeShape,
    yellowShape,
    purpleEyes,
    blackEyes,
    orangeEyes,
    yellowEyes,
    handleMouseMove,
    handleInput,
    handleInputFocus,
    handleInputBlur,
    togglePassword,
    handleLogin,
  }
}
