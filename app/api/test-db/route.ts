import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET() {
  // Log das variáveis de ambiente (sem expor valores sensíveis)
  console.log('[Test-DB] Verificando configuração:', {
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL ? 'DEFINIDA' : 'NÃO DEFINIDA',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NÃO DEFINIDA',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'DEFINIDA' : 'NÃO DEFINIDA',
    timestamp: new Date().toISOString()
  })

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } // Necessário para Supabase
      : false
  })

  try {
    console.log('[Test-DB] Tentando conectar ao banco...')
    await client.connect()
    console.log('[Test-DB] Conexão estabelecida')
    
    // Teste simples de conexão
    const timeResult = await client.query('SELECT NOW() as current_time')
    
    // Verificar se a tabela de usuários existe
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'app_users'
      )
    `)
    
    // Contar usuários (sem expor dados sensíveis)
    let userCount = 0
    if (tableResult.rows[0].exists) {
      const countResult = await client.query('SELECT COUNT(*) as count FROM app_users')
      userCount = parseInt(countResult.rows[0].count)
    }
    
    await client.end()
    console.log('[Test-DB] Conexão fechada com sucesso')
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        currentTime: timeResult.rows[0].current_time,
        appUsersTableExists: tableResult.rows[0].exists,
        userCount: userCount
      },
      nextauth: {
        urlConfigured: !!process.env.NEXTAUTH_URL,
        secretConfigured: !!process.env.NEXTAUTH_SECRET,
        url: process.env.NEXTAUTH_URL || 'NOT SET'
      }
    })
  } catch (error) {
    console.error('[Test-DB] Erro:', error)
    
    return NextResponse.json({
      success: false,
      environment: process.env.NODE_ENV,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      nextauth: {
        urlConfigured: !!process.env.NEXTAUTH_URL,
        secretConfigured: !!process.env.NEXTAUTH_SECRET,
        url: process.env.NEXTAUTH_URL || 'NOT SET'
      }
    }, { status: 500 })
  }
}