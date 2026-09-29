/**
 * Storage & Data Access Layer for Sabor & Gestão
 * Handles localStorage persistence, data schema, stock management, and business rules calculation.
 */

const STORAGE_KEY = 'sabor_gestao_db_v1';

const defaultSeedData = {
  usuarios: [
    {
      id: "u-gerente-01",
      tipo: "funcionario",
      nome: "Gerente General",
      login: "admin",
      senha: "123",
      perfil: "Gerente",
      ativo: true,
      criado_em: new Date().toISOString()
    },
    {
      id: "u-atendente-01",
      tipo: "funcionario",
      nome: "Carlos Atendente",
      login: "atendente",
      senha: "123",
      perfil: "Atendente",
      ativo: true,
      criado_em: new Date().toISOString()
    },
    {
      id: "u-mesa-01",
      tipo: "mesa",
      nome: "Mesa 01",
      login: "mesa01",
      senha: "123",
      perfil: null,
      ativo: true,
      criado_em: new Date().toISOString()
    },
    {
      id: "u-mesa-02",
      tipo: "mesa",
      nome: "Mesa 02",
      login: "mesa02",
      senha: "123",
      perfil: null,
      ativo: true,
      criado_em: new Date().toISOString()
    },
    {
      id: "u-mesa-04",
      tipo: "mesa",
      nome: "Mesa 04",
      login: "mesa04",
      senha: "123",
      perfil: null,
      ativo: true,
      criado_em: new Date().toISOString()
    },
    {
      id: "u-mesa-05",
      tipo: "mesa",
      nome: "Mesa 05",
      login: "mesa05",
      senha: "123",
      perfil: null,
      ativo: true,
      criado_em: new Date().toISOString()
    },
    {
      id: "u-mesa-08",
      tipo: "mesa",
      nome: "Mesa 08",
      login: "mesa08",
      senha: "123",
      perfil: null,
      ativo: true,
      criado_em: new Date().toISOString()
    },
    {
      id: "u-mesa-12",
      tipo: "mesa",
      nome: "Mesa 12",
      login: "mesa12",
      senha: "123",
      perfil: null,
      ativo: true,
      criado_em: new Date().toISOString()
    },
    {
      id: "u-deck-01",
      tipo: "mesa",
      nome: "Deck 01",
      login: "deck01",
      senha: "123",
      perfil: null,
      ativo: true,
      criado_em: new Date().toISOString()
    }
  ],

  ingredientes: [
    { id: "ing-01", nome: "Filé Mignon", unidade: "kg", quantidade: 10.0 },
    { id: "ing-02", nome: "Molho Roti", unidade: "L", quantidade: 5.0 },
    { id: "ing-03", nome: "Arroz Arbóreo", unidade: "kg", quantidade: 8.0 },
    { id: "ing-04", nome: "Cogumelos Trufados", unidade: "kg", quantidade: 3.0 },
    { id: "ing-05", nome: "Tentáculos de Polvo", unidade: "kg", quantidade: 6.0 },
    { id: "ing-06", nome: "Páprica Defumada", unidade: "kg", quantidade: 2.0 },
    { id: "ing-07", nome: "Robalo Fresco", unidade: "kg", quantidade: 5.0 },
    { id: "ing-08", nome: "Limão Taiti", unidade: "kg", quantidade: 10.0 },
    { id: "ing-09", nome: "Gin Importado", unidade: "L", quantidade: 4.0 },
    { id: "ing-10", nome: "Tangerina & Alecrim", unidade: "kg", quantidade: 3.0 },
    { id: "ing-11", nome: "Feijão Preto", unidade: "kg", quantidade: 15.0 },
    { id: "ing-12", nome: "Arroz Branco", unidade: "kg", quantidade: 20.0 }
  ],

  pratos: [
    {
      id: "p-01",
      nome: "Tornedor de Filé ao Molho Roti",
      descricao: "Corte nobre de filé mignon grelhado com redução de molho roti artesanal, acompanhado de mousseline de batata.",
      preco: 89.90,
      imagem: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      destaque: true,
      categoria: "Pratos Principais",
      ativo: true,
      ingredientes: [
        { ingrediente_id: "ing-01", quantidade: 0.25, unidade: "kg" },
        { ingrediente_id: "ing-02", quantidade: 0.1, unidade: "L" }
      ]
    },
    {
      id: "p-02",
      nome: "Risoto de Cogumelos Trufados",
      descricao: "Arroz arbóreo cremoso com seleção de cogumelos frescos, finalizado com azeite de trufas brancas e parmesão.",
      preco: 68.00,
      imagem: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
      destaque: true,
      categoria: "Pratos Principais",
      ativo: true,
      ingredientes: [
        { ingrediente_id: "ing-03", quantidade: 0.2, unidade: "kg" },
        { ingrediente_id: "ing-04", quantidade: 0.15, unidade: "kg" }
      ]
    },
    {
      id: "p-03",
      nome: "Polvo Grelhado com Páprica",
      descricao: "Tentáculos de polvo grelhados no azeite de ervas, acompanhados de batatas ao murro e páprica espanhola.",
      preco: 112.50,
      imagem: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
      destaque: true,
      categoria: "Pratos Principais",
      ativo: true,
      ingredientes: [
        { ingrediente_id: "ing-05", quantidade: 0.3, unidade: "kg" },
        { ingrediente_id: "ing-06", quantidade: 0.05, unidade: "kg" }
      ]
    },
    {
      id: "p-04",
      nome: "Ceviche Clássico de Robalo",
      descricao: "Cubos de robalo fresco marinados em leite de tigre, pimenta dedo-de-moça, cebola roxa e milho tostado.",
      preco: 54.00,
      imagem: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=800&q=80",
      destaque: false,
      categoria: "Entradas",
      ativo: true,
      ingredientes: [
        { ingrediente_id: "ing-07", quantidade: 0.2, unidade: "kg" },
        { ingrediente_id: "ing-08", quantidade: 0.1, unidade: "kg" }
      ]
    },
    {
      id: "p-05",
      nome: "Gin Tônica Tangerina & Alecrim",
      descricao: "Gin artesanal infusionado, xarope natural de tangerina, tônica premium e ramo de alecrim tostado.",
      preco: 32.00,
      imagem: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
      destaque: false,
      categoria: "Bebidas & Coquetéis",
      ativo: true,
      ingredientes: [
        { ingrediente_id: "ing-09", quantidade: 0.05, unidade: "L" },
        { ingrediente_id: "ing-10", quantidade: 0.05, unidade: "kg" }
      ]
    },
    {
      id: "p-06",
      nome: "Feijoada Completa",
      descricao: "Feijoada tradicional com arroz, couve refogada, farofa e laranja fatiada.",
      preco: 45.90,
      imagem: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80",
      destaque: true,
      categoria: "Pratos Principais",
      ativo: true,
      ingredientes: [
        { ingrediente_id: "ing-11", quantidade: 0.3, unidade: "kg" },
        { ingrediente_id: "ing-12", quantidade: 0.2, unidade: "kg" }
      ]
    }
  ],

  pedidos: [
    {
      id: "ped-101",
      mesa_id: "u-mesa-05",
      itens: [
        { prato_id: "p-01", prato_nome: "Tornedor de Filé ao Molho Roti", quantidade: 1, preco_unitario: 89.90 },
        { prato_id: "p-05", prato_nome: "Gin Tônica Tangerina & Alecrim", quantidade: 2, preco_unitario: 32.00 }
      ],
      valor_total: 153.90,
      status: "Em preparo",
      criado_em: new Date(Date.now() - 25 * 60000).toISOString(),
      atualizado_em: new Date(Date.now() - 20 * 60000).toISOString()
    },
    {
      id: "ped-102",
      mesa_id: "u-mesa-02",
      itens: [
        { prato_id: "p-02", prato_nome: "Risoto de Cogumelos Trufados", quantidade: 2, preco_unitario: 68.00 }
      ],
      valor_total: 136.00,
      status: "Pronto",
      criado_em: new Date(Date.now() - 40 * 60000).toISOString(),
      atualizado_em: new Date(Date.now() - 10 * 60000).toISOString()
    },
    {
      id: "ped-103",
      mesa_id: "u-mesa-08",
      itens: [
        { prato_id: "p-03", prato_nome: "Polvo Grelhado com Páprica", quantidade: 1, preco_unitario: 112.50 }
      ],
      valor_total: 112.50,
      status: "Recebido",
      criado_em: new Date(Date.now() - 5 * 60000).toISOString(),
      atualizado_em: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: "ped-100",
      mesa_id: "u-mesa-05",
      itens: [
        { prato_id: "p-04", prato_nome: "Ceviche Clássico de Robalo", quantidade: 1, preco_unitario: 54.00 }
      ],
      valor_total: 54.00,
      status: "Entregue",
      criado_em: new Date(Date.now() - 90 * 60000).toISOString(),
      atualizado_em: new Date(Date.now() - 60 * 60000).toISOString()
    }
  ],

  chamados: [
    {
      id: "ch-01",
      mesa_id: "u-mesa-05",
      justificativa: "Preciso de água mineral sem gás",
      status: "Pendente",
      criado_em: new Date(Date.now() - 8 * 60000).toISOString(),
      atendido_em: null
    },
    {
      id: "ch-02",
      mesa_id: "u-mesa-12",
      justificativa: "Talheres adicionais e guardanapos",
      status: "Pendente",
      criado_em: new Date(Date.now() - 14 * 60000).toISOString(),
      atendido_em: null
    }
  ]
};

const StorageManager = {
  getDB() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.saveDB(defaultSeedData);
      return JSON.parse(JSON.stringify(defaultSeedData));
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading db, re-seeding", e);
      this.saveDB(defaultSeedData);
      return JSON.parse(JSON.stringify(defaultSeedData));
    }
  },

  saveDB(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  },

  generateUUID() {
    return 'id-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
  },

  // Availability calculation (RN-02)
  // disponível = estoque_do_ingrediente / quantidade_necessária_por_prato para cada ingrediente.
  // Se algum ingrediente estiver abaixo do necessário (para 1 porção), o prato fica indisponível.
  getPratoDisponibilidade(prato, db = null) {
    if (!db) db = this.getDB();
    if (!prato.ativo) return { disponivel: false, maxPorcoes: 0 };
    if (!prato.ingredientes || prato.ingredientes.length === 0) return { disponivel: true, maxPorcoes: 999 };

    let maxPorcoes = Infinity;
    for (const req of prato.ingredientes) {
      const ing = db.ingredientes.find(i => i.id === req.ingrediente_id);
      if (!ing || ing.quantidade < req.quantidade) {
        return { disponivel: false, maxPorcoes: 0 };
      }
      const porcoesPossiveis = Math.floor(ing.quantidade / req.quantidade);
      if (porcoesPossiveis < maxPorcoes) {
        maxPorcoes = porcoesPossiveis;
      }
    }

    return {
      disponivel: maxPorcoes >= 1,
      maxPorcoes: maxPorcoes === Infinity ? 999 : maxPorcoes
    };
  },

  // Order Placement & Stock Deduction (RN-03)
  criarPedido(mesaId, itens) {
    const db = this.getDB();

    // Verify stock availability first for all items
    for (const item of itens) {
      const prato = db.pratos.find(p => p.id === item.prato_id);
      if (!prato) throw new Error(`Prato ${item.prato_id} não encontrado.`);

      const disp = this.getPratoDisponibilidade(prato, db);
      if (!disp.disponivel || disp.maxPorcoes < item.quantidade) {
        throw new Error(`Ingredientes insuficientes no estoque para o prato "${prato.nome}".`);
      }
    }

    // Deduct ingredients (RN-03)
    for (const item of itens) {
      const prato = db.pratos.find(p => p.id === item.prato_id);
      for (const req of prato.ingredientes) {
        const ing = db.ingredientes.find(i => i.id === req.ingrediente_id);
        if (ing) {
          ing.quantidade = Math.max(0, parseFloat((ing.quantidade - (req.quantidade * item.quantidade)).toFixed(4)));
        }
      }
    }

    // Calculate total value
    const valor_total = itens.reduce((sum, item) => sum + (item.preco_unitario * item.quantidade), 0);

    const novoPedido = {
      id: this.generateUUID(),
      mesa_id: mesaId,
      itens: itens,
      valor_total: parseFloat(valor_total.toFixed(2)),
      status: "Recebido",
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };

    db.pedidos.unshift(novoPedido);
    this.saveDB(db);
    return novoPedido;
  },

  // Update order status & cancellation stock restore (RN-04)
  atualizarStatusPedido(pedidoId, novoStatus) {
    const db = this.getDB();
    const pedido = db.pedidos.find(p => p.id === pedidoId);
    if (!pedido) throw new Error("Pedido não encontrado.");

    const statusAnterior = pedido.status;
    if (statusAnterior === novoStatus) return pedido;

    // If changing TO "Cancelado" from a non-cancelled state, restore ingredients (RN-04)
    if (novoStatus === "Cancelado" && statusAnterior !== "Cancelado") {
      for (const item of pedido.itens) {
        const prato = db.pratos.find(p => p.id === item.prato_id);
        if (prato && prato.ingredientes) {
          for (const req of prato.ingredientes) {
            const ing = db.ingredientes.find(i => i.id === req.ingrediente_id);
            if (ing) {
              ing.quantidade = parseFloat((ing.quantidade + (req.quantidade * item.quantidade)).toFixed(4));
            }
          }
        }
      }
    }

    // If changing FROM "Cancelado" to active, re-deduct stock if possible
    if (statusAnterior === "Cancelado" && novoStatus !== "Cancelado") {
      for (const item of pedido.itens) {
        const prato = db.pratos.find(p => p.id === item.prato_id);
        if (prato && prato.ingredientes) {
          for (const req of prato.ingredientes) {
            const ing = db.ingredientes.find(i => i.id === req.ingrediente_id);
            if (ing) {
              ing.quantidade = Math.max(0, parseFloat((ing.quantidade - (req.quantidade * item.quantidade)).toFixed(4)));
            }
          }
        }
      }
    }

    pedido.status = novoStatus;
    pedido.atualizado_em = new Date().toISOString();
    this.saveDB(db);
    return pedido;
  },

  // Staff Call management (RF-26, RF-27, RF-28, RF-31)
  criarChamado(mesaId, justificativa) {
    const db = this.getDB();
    const novoChamado = {
      id: this.generateUUID(),
      mesa_id: mesaId,
      justificativa: justificativa.trim(),
      status: "Pendente",
      criado_em: new Date().toISOString(),
      atendido_em: null
    };

    db.chamados.unshift(novoChamado);
    this.saveDB(db);
    return novoChamado;
  },

  atenderChamado(chamadoId) {
    const db = this.getDB();
    const chamado = db.chamados.find(c => c.id === chamadoId);
    if (!chamado) throw new Error("Chamado não encontrado.");

    chamado.status = "Atendido";
    chamado.atendido_em = new Date().toISOString();
    this.saveDB(db);
    return chamado;
  },

  // Export / Import (RF-41, RF-42)
  exportarDadosJSON() {
    const db = this.getDB();
    const jsonStr = JSON.stringify(db, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sabor_gestao_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importarDadosJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.usuarios || !parsed.pratos || !parsed.ingredientes || !parsed.pedidos || !parsed.chamados) {
        throw new Error("Formato de JSON inválido. Deve conter usuarios, pratos, ingredientes, pedidos e chamados.");
      }
      this.saveDB(parsed);
      return true;
    } catch (err) {
      throw err;
    }
  }
};
