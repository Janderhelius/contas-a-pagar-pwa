/**
 * Funções para gerenciamento de categorias
 */

import { db, Categoria } from './db';
import { nanoid } from 'nanoid';

/**
 * Obter todas as categorias ativas ordenadas
 */
export async function obterCategorias(): Promise<Categoria[]> {
  try {
    const categorias = await db.categorias.toArray();
    return categorias
      .filter(c => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (erro) {
    console.error('Erro ao obter categorias:', erro);
    return [];
  }
}

/**
 * Obter categorias padrão
 */
export async function obterCategoriasPadrao(): Promise<Categoria[]> {
  try {
    const categorias = await db.categorias.toArray();
    return categorias
      .filter(c => c.isDefault && c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (erro) {
    console.error('Erro ao obter categorias padrão:', erro);
    return [];
  }
}

/**
 * Obter categorias personalizadas
 */
export async function obterCategoriasPersonalizadas(): Promise<Categoria[]> {
  try {
    const categorias = await db.categorias.toArray();
    return categorias
      .filter(c => !c.isDefault && c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (erro) {
    console.error('Erro ao obter categorias personalizadas:', erro);
    return [];
  }
}

/**
 * Criar nova categoria personalizada
 */
export async function criarCategoria(nome: string): Promise<Categoria | null> {
  try {
    // Validar
    if (!nome || nome.trim().length < 2) {
      throw new Error('Nome da categoria deve ter pelo menos 2 caracteres');
    }

    // Verificar duplicatas (case-insensitive)
    const existentes = await db.categorias.toArray();
    const nomeLower = nome.toLowerCase();
    if (existentes.some(c => c.name.toLowerCase() === nomeLower)) {
      throw new Error('Categoria com este nome já existe');
    }

    // Calcular sortOrder
    const maxSort = existentes.reduce((max, c) => Math.max(max, c.sortOrder), 0);

    const novaCategoria: Categoria = {
      id: nanoid(),
      name: nome.trim(),
      isDefault: false,
      isActive: true,
      sortOrder: maxSort + 1,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    await db.categorias.add(novaCategoria);
    return novaCategoria;
  } catch (erro) {
    console.error('Erro ao criar categoria:', erro);
    throw erro;
  }
}

/**
 * Editar nome de categoria
 */
export async function editarCategoria(id: string, novoNome: string): Promise<void> {
  try {
    const categoria = await db.categorias.get(id);
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }

    if (!novoNome || novoNome.trim().length < 2) {
      throw new Error('Nome da categoria deve ter pelo menos 2 caracteres');
    }

    // Verificar duplicatas (case-insensitive)
    const existentes = await db.categorias.toArray();
    const nomeLower = novoNome.toLowerCase();
    if (existentes.some(c => c.id !== id && c.name.toLowerCase() === nomeLower)) {
      throw new Error('Categoria com este nome já existe');
    }

    await db.categorias.update(id, {
      name: novoNome.trim(),
      atualizadoEm: new Date(),
    });
  } catch (erro) {
    console.error('Erro ao editar categoria:', erro);
    throw erro;
  }
}

/**
 * Deletar categoria personalizada
 * Se estiver em uso, retorna erro com lista de contas
 */
export async function deletarCategoria(id: string): Promise<void> {
  try {
    const categoria = await db.categorias.get(id);
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }

    if (categoria.isDefault) {
      throw new Error('Não é possível deletar categorias padrão');
    }

    // Verificar se está em uso
    const contasComCategoria = await db.contas
      .where('categoria')
      .equals(categoria.name)
      .toArray();

    if (contasComCategoria.length > 0) {
      throw new Error(`Categoria está em uso em ${contasComCategoria.length} conta(s). Substitua antes de deletar.`);
    }

    // Deletar
    await db.categorias.delete(id);
  } catch (erro) {
    console.error('Erro ao deletar categoria:', erro);
    throw erro;
  }
}

/**
 * Substituir categoria em todas as contas
 */
export async function substituirCategoriaEmContas(
  categoriaDeletarId: string,
  categoriaSubstituirId: string
): Promise<number> {
  try {
    const categoriaDeletar = await db.categorias.get(categoriaDeletarId);
    const categoriaSubstituir = await db.categorias.get(categoriaSubstituirId);

    if (!categoriaDeletar || !categoriaSubstituir) {
      throw new Error('Categoria não encontrada');
    }

    // Atualizar todas as contas
    const contas = await db.contas
      .where('categoria')
      .equals(categoriaDeletar.name)
      .toArray();

    for (const conta of contas) {
      await db.contas.update(conta.id, {
        categoria: categoriaSubstituir.name,
      });
    }

    // Deletar categoria
    await db.categorias.delete(categoriaDeletarId);

    return contas.length;
  } catch (erro) {
    console.error('Erro ao substituir categoria:', erro);
    throw erro;
  }
}

/**
 * Desativar categoria (soft delete)
 */
export async function desativarCategoria(id: string): Promise<void> {
  try {
    const categoria = await db.categorias.get(id);
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }

    if (categoria.isDefault) {
      throw new Error('Não é possível desativar categorias padrão');
    }

    await db.categorias.update(id, {
      isActive: false,
      atualizadoEm: new Date(),
    });
  } catch (erro) {
    console.error('Erro ao desativar categoria:', erro);
    throw erro;
  }
}

/**
 * Obter categoria por ID
 */
export async function obterCategoriaPorId(id: string): Promise<Categoria | undefined> {
  try {
    return await db.categorias.get(id);
  } catch (erro) {
    console.error('Erro ao obter categoria:', erro);
    return undefined;
  }
}

/**
 * Obter categoria por nome
 */
export async function obterCategoriaPorNome(nome: string): Promise<Categoria | undefined> {
  try {
    const categorias = await db.categorias.toArray();
    return categorias.find(c => c.name.toLowerCase() === nome.toLowerCase() && c.isActive);
  } catch (erro) {
    console.error('Erro ao obter categoria por nome:', erro);
    return undefined;
  }
}

/**
 * Verificar se categoria está em uso
 */
export async function verificarCategoriaEmUso(id: string): Promise<number> {
  try {
    const categoria = await db.categorias.get(id);
    if (!categoria) return 0;

    const contas = await db.contas
      .where('categoria')
      .equals(categoria.name)
      .toArray();

    return contas.length;
  } catch (erro) {
    console.error('Erro ao verificar categoria em uso:', erro);
    return 0;
  }
}

/**
 * Reordenar categorias
 */
export async function reordenarCategorias(ids: string[]): Promise<void> {
  try {
    for (let i = 0; i < ids.length; i++) {
      await db.categorias.update(ids[i], {
        sortOrder: i + 1,
        atualizadoEm: new Date(),
      });
    }
  } catch (erro) {
    console.error('Erro ao reordenar categorias:', erro);
    throw erro;
  }
}
