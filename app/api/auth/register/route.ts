import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
    })

    try {
      await client.connect()
      
      // Verificar se o email já existe
      const checkQuery = 'SELECT id FROM app_users WHERE email = $1'
      const checkResult = await client.query(checkQuery, [email])
      
      if (checkResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 400 }
        )
      }
      
      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10)
      
      // Inserir novo usuário
      const insertQuery = `
        INSERT INTO app_users (name, email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id, name, email
      `
      
      const result = await client.query(insertQuery, [name, email, passwordHash])
      
      return NextResponse.json({
        success: true,
        user: result.rows[0]
      })
      
    } finally {
      await client.end()
    }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    )
  }
}