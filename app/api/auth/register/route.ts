import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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

    try {
      // Verificar se o email já existe
      const { data: existingUser } = await supabaseAdmin
        .from('app_users')
        .select('id')
        .eq('email', email)
        .single()
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 400 }
        )
      }
    } catch (error: any) {
      // Se o erro for porque não encontrou usuário existente, isso é esperado
      if (error?.code !== 'PGRST116') {
        throw error
      }
    }
    
    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Inserir novo usuário
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('app_users')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, name, email')
      .single()
    
    if (insertError) {
      throw insertError
    }
    
    return NextResponse.json({
      success: true,
      user: newUser
    })
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    )
  }
}