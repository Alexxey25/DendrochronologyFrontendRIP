export const ZEROTIER_PC_HOST = '192.168.194.69'
export const ZEROTIER_PHONE_HOST = '192.168.194.10'

export const ZEROTIER_HOST = ZEROTIER_PC_HOST
export const BACKEND_HOST = ZEROTIER_PC_HOST
export const LOCAL_BACKEND_HOST = '127.0.0.1'
export const API_PORT = 8080
export const MINIO_PORT = 9090

export const API_ORIGIN_PC = `http://${ZEROTIER_PC_HOST}:${API_PORT}`
export const MINIO_ORIGIN_PC = `http://${ZEROTIER_PC_HOST}:${MINIO_PORT}`
