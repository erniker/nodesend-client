import authContext from './authContext'
import React, { useReducer } from 'react'
import authReducer from './authReducer'
import {
  REGISTRO_EXITOSO,
  REGISTRO_ERROR,
  OCULTAR_ALERTA,
  LOGIN_EXITOSO,
  LOGIN_ERROR,
  USUARIO_AUTENTICADO,
  CERRAR_SESION,
} from '../../types'

import clienteAxios from '../../config/axios'
import tokenAuth from '../../config/tokenAuth'

const AuthState = ({ children }) => {
  // Estate Inicial
  const initalState = {
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : '',
    autenticado: null,
    usuario: null,
    mensaje: null,
    cargando: null,
  }
  // Definición del Reducer
  const [state, dispatch] = useReducer(authReducer, initalState)

  // Registrar nuevo usuario
  const registrarUsuario = async datos => {
    try {
      const respuesta = await clienteAxios.post('/api/users', datos)
      dispatch({
        type: REGISTRO_EXITOSO,
        payload: respuesta.data.msg,
      })
    } catch (error) {
      dispatch({
        type: REGISTRO_ERROR,
        payload: error.response.data.msg,
      })
    }
    // Limpia la alerta despues de 3 segundos:
    setTimeout(() => {
      dispatch({
        type: OCULTAR_ALERTA,
      })
    }, 3000)
  }

  // Autenticar Usuarios
  const iniciarSesion = async datos => {
    try {
      const respuesta = await clienteAxios.post('/api/auth', datos)
      dispatch({
        type: LOGIN_EXITOSO,
        payload: respuesta.data.token,
      })
    } catch (error) {
      dispatch({
        type: LOGIN_ERROR,
        payload: error.response.data.msg,
      })
    }
    // Limpia la alerta despues de 3 segundos:
    setTimeout(() => {
      dispatch({
        type: OCULTAR_ALERTA,
      })
    }, 3000)
  }

  // Retorna el usuario Autenticado en base al JWT
  const usuarioAutenticado = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      tokenAuth(token)
    }
    try {
      const respuesta = await clienteAxios.get('/api/auth')
      if (respuesta.data.user) {
        dispatch({
          type: USUARIO_AUTENTICADO,
          payload: respuesta.data.user,
        })
      }
    } catch (error) {
      dispatch({
        type: LOGIN_ERROR,
        payload: error.response.data.msg,
      })
    }
  }

  //Cerrar sesióm
  const cerrarSesion = () => {
    dispatch({
      type: CERRAR_SESION,
    })
  }

  return (
    <authContext.Provider
      value={{
        token: state.token,
        autenticado: state.autenticado,
        usuario: state.usuario,
        mensaje: state.mensaje,
        registrarUsuario,
        usuarioAutenticado,
        iniciarSesion,
        cerrarSesion,
      }}>
      {children}
    </authContext.Provider>
  )
}

export default AuthState
