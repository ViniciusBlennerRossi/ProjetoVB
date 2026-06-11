/**
 * Fiore Pijamas - Camada de Dados (Supabase)
 * Todos os métodos são async/await
 */

// Utilitários globais
function hoje() { return new Date().toISOString().split('T')[0]; }
function addDias(dataStr, dias) {
  const d = new Date(dataStr + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

// Helper: lança erro visível se query falhar
async function _query(promise) {
  const { data, error } = await promise;
  if (error) { console.error('Supabase erro:', error); throw error; }
  return data;
}

// Helper: retorna o id_loja do usuário logado
function _idLoja() {
  return (typeof Auth !== 'undefined' ? Auth.usuario()?.id_loja : null);
}

// ===== NÚMERO SEQUENCIAL =====
function _numero(id, prefixo = '', tamanho = 5) {
  return prefixo + String(id).padStart(tamanho, '0');
}

const _CAMPOS_USUARIO = 'id,nome,email,papel,permissoes,ativo,criado_em';

const DB = {

  // ===== USUÁRIOS =====
  Usuarios: {
    async todos() {
      return await _query(_sb.from('usuarios').select(_CAMPOS_USUARIO).eq('id_loja', _idLoja()).order('nome'));
    },
    async ativos() {
      return await _query(_sb.from('usuarios').select(_CAMPOS_USUARIO).eq('id_loja', _idLoja()).eq('ativo', true).order('nome'));
    },
    async porId(id) {
      return await _query(_sb.from('usuarios').select(_CAMPOS_USUARIO).eq('id_loja', _idLoja()).eq('id', id).single());
    },
    async porEmail(email) {
      const { data } = await _sb.from('usuarios').select(_CAMPOS_USUARIO).eq('id_loja', _idLoja()).ilike('email', email).single();
      return data;
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('usuarios').update(dados).eq('id', id).select().single());
      }
      return await _query(_sb.from('usuarios').insert({ ...dados, id_loja: _idLoja() }).select().single());
    },
    async deletar(id) {
      await _query(_sb.from('usuarios').delete().eq('id', id));
    },
    async autenticar(email, senha, idLoja) {
      let query = _sb.from('usuarios')
        .select('*')
        .ilike('email', email).eq('senha', senha).neq('ativo', false);
      if (idLoja) query = query.eq('id_loja', idLoja);
      const { data } = await query.single();
      return data || null;
    },
    async salvarPermissoes(id, permissoes) {
      return await _query(_sb.from('usuarios').update({ permissoes }).eq('id', id).select().single());
    }
  },

  // ===== CLIENTES =====
  Clientes: {
    async todos() {
      return await _query(_sb.from('clientes').select('*').eq('id_loja', _idLoja()).order('nome'));
    },
    async ativos() {
      return await _query(_sb.from('clientes').select('*').eq('id_loja', _idLoja()).eq('ativo', true).order('nome'));
    },
    async porId(id) {
      return await _query(_sb.from('clientes').select('*').eq('id_loja', _idLoja()).eq('id', id).single());
    },
    async buscar(termo) {
      const { data } = await _sb.from('clientes').select('*').eq('id_loja', _idLoja()).eq('ativo', true)
        .or(`nome.ilike.%${termo}%,telefone.ilike.%${termo}%,cpf.ilike.%${termo}%`)
        .order('nome').limit(8);
      return data || [];
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('clientes').update(dados).eq('id', id).select().single());
      }
      return await _query(_sb.from('clientes').insert({ ...dados, ativo: true, id_loja: _idLoja() }).select().single());
    },
    async deletar(id) {
      await _query(_sb.from('clientes').update({ ativo: false }).eq('id', id));
    }
  },

  // ===== FORNECEDORES =====
  Fornecedores: {
    async todos() {
      return await _query(_sb.from('fornecedores').select('*').eq('id_loja', _idLoja()).order('nome'));
    },
    async ativos() {
      return await _query(_sb.from('fornecedores').select('*').eq('id_loja', _idLoja()).eq('ativo', true).order('nome'));
    },
    async porId(id) {
      return await _query(_sb.from('fornecedores').select('*').eq('id_loja', _idLoja()).eq('id', id).single());
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('fornecedores').update(dados).eq('id', id).select().single());
      }
      return await _query(_sb.from('fornecedores').insert({ ...dados, ativo: true, id_loja: _idLoja() }).select().single());
    },
    async deletar(id) {
      await _query(_sb.from('fornecedores').update({ ativo: false }).eq('id', id));
    }
  },

  // ===== FUNCIONÁRIOS =====
  Funcionarios: {
    async todos() {
      return await _query(_sb.from('funcionarios').select('*').eq('id_loja', _idLoja()).order('nome'));
    },
    async ativos() {
      return await _query(_sb.from('funcionarios').select('*').eq('id_loja', _idLoja()).eq('ativo', true).order('nome'));
    },
    async porId(id) {
      return await _query(_sb.from('funcionarios').select('*').eq('id_loja', _idLoja()).eq('id', id).single());
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('funcionarios').update(dados).eq('id', id).select().single());
      }
      return await _query(_sb.from('funcionarios').insert({ ...dados, id_loja: _idLoja() }).select().single());
    },
    async deletar(id) {
      await _query(_sb.from('funcionarios').update({ ativo: false }).eq('id', id));
    },
    async totalFolha() {
      const { data } = await _sb.from('funcionarios').select('salario').eq('id_loja', _idLoja()).eq('ativo', true);
      return (data || []).reduce((s, f) => s + (f.salario || 0), 0);
    }
  },

  // ===== CATEGORIAS =====
  Categorias: {
    async todas() {
      return await _query(_sb.from('categorias').select('*').eq('id_loja', _idLoja()).order('nome'));
    },
    async porId(id) {
      const { data } = await _sb.from('categorias').select('*').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('categorias').update(dados).eq('id', id).select().single());
      }
      return await _query(_sb.from('categorias').insert({ ...dados, id_loja: _idLoja() }).select().single());
    }
  },

  // ===== PRODUTOS =====
  Produtos: {
    async todos() {
      return await _query(_sb.from('produtos').select('*, categorias(nome)').eq('id_loja', _idLoja()).order('id'));
    },
    async ativos() {
      return await _query(_sb.from('produtos').select('*, categorias(nome)').eq('id_loja', _idLoja()).eq('ativo', true).order('id'));
    },
    async porId(id) {
      const { data } = await _sb.from('produtos').select('*, categorias(nome)').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async porCodigo(cod) {
      const { data } = await _sb.from('produtos').select('*').eq('id_loja', _idLoja()).eq('codigo', cod).single();
      return data;
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('produtos').update(dados).eq('id', id).select().single());
      }
      return await _query(_sb.from('produtos').insert({ ...dados, ativo: true, estoque: dados.estoque || 0, id_loja: _idLoja() }).select().single());
    },
    async deletar(id) {
      await _query(_sb.from('produtos').update({ ativo: false }).eq('id', id));
    },
    async atualizarEstoque(id, qtd) {
      const { data: prod, error: errSel } = await _sb.from('produtos').select('estoque').eq('id', id).single();
      if (errSel) { console.error('atualizarEstoque select:', errSel); throw errSel; }
      const novoEst = ((prod?.estoque) || 0) + qtd;
      await _query(_sb.from('produtos').update({ estoque: novoEst }).eq('id', id));
    },
    async comEstoqueBaixo(minimo = 1) {
      return await _query(_sb.from('produtos').select('*, categorias(nome)').eq('id_loja', _idLoja()).eq('ativo', true).lte('estoque', minimo).order('estoque'));
    }
  },

  // ===== MOVIMENTAÇÕES =====
  Movimentacoes: {
    async todas() {
      return await _query(_sb.from('movimentacoes').select('*, produtos(nome)').eq('id_loja', _idLoja()).order('data', { ascending: false }));
    },
    async porProduto(prodId) {
      return await _query(_sb.from('movimentacoes').select('*').eq('id_loja', _idLoja()).eq('produto_id', prodId).order('data', { ascending: false }));
    },
    async recentes(n = 10) {
      return await _query(_sb.from('movimentacoes').select('*, produtos(nome)').eq('id_loja', _idLoja()).order('data', { ascending: false }).limit(n));
    },
    async salvar(dados) {
      const mov = await _query(_sb.from('movimentacoes').insert({ ...dados, id_loja: _idLoja() }).select().single());
      const qtd = dados.tipo === 'entrada' ? dados.quantidade : -dados.quantidade;
      await DB.Produtos.atualizarEstoque(dados.produto_id, qtd);
      return mov;
    },
    async porVendaNumero(numero) {
      // Retorna os produtos vendidos buscando nas movimentações de saída
      return await _query(
        _sb.from('movimentacoes').select('produto_id, quantidade')
          .eq('id_loja', _idLoja())
          .eq('tipo', 'saida')
          .eq('motivo', `Venda #${numero}`)
      );
    },
    async filtrar(tipo, dataInicio, dataFim) {
      let q = _sb.from('movimentacoes').select('*, produtos(nome)').eq('id_loja', _idLoja()).order('data', { ascending: false });
      if (tipo) q = q.eq('tipo', tipo);
      if (dataInicio) q = q.gte('data', dataInicio);
      if (dataFim) q = q.lte('data', dataFim + 'T23:59:59');
      return await _query(q);
    }
  },

  // ===== VENDAS =====
  Vendas: {
    async todas() {
      return await _query(_sb.from('vendas').select('*, venda_itens(*)').eq('id_loja', _idLoja()).order('data', { ascending: false }));
    },
    async porId(id) {
      const { data } = await _sb.from('vendas').select('*, venda_itens(*)').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async porNumero(numero) {
      const rows = await _query(_sb.from('vendas').select('*, venda_itens(*)').eq('id_loja', _idLoja()).eq('numero', numero).limit(1));
      return Array.isArray(rows) ? (rows[0] || null) : (rows || null);
    },
    async recentes(n = 10) {
      return await _query(_sb.from('vendas').select('*, venda_itens(*)').eq('id_loja', _idLoja()).order('data', { ascending: false }).limit(n));
    },
    async filtrar(filtros = {}) {
      let q = _sb.from('vendas').select('*, venda_itens(*)').eq('id_loja', _idLoja()).order('data', { ascending: false });
      if (filtros.dataInicio) q = q.gte('data', filtros.dataInicio);
      if (filtros.dataFim)    q = q.lte('data', filtros.dataFim + 'T23:59:59');
      if (filtros.status)     q = q.or(`status.eq.${filtros.status},status_pgto.eq.${filtros.status}`);
      if (filtros.busca) {
        q = q.or(`numero.ilike.%${filtros.busca}%,cliente.ilike.%${filtros.busca}%`);
      }
      return await _query(q);
    },
    async doMes(ano, mes) {
      const inicio = `${ano}-${String(mes+1).padStart(2,'0')}-01`;
      const fim = new Date(ano, mes+1, 0).toISOString().split('T')[0];
      return await _query(_sb.from('vendas').select('*').eq('id_loja', _idLoja()).gte('data', inicio).lte('data', fim + 'T23:59:59'));
    },
    async salvar(dados) {
      const itens = dados.itens || [];
      delete dados.itens;

      // 1. Inserir venda (garante que data nunca seja null)
      if (!dados.data) dados.data = new Date().toISOString();
      const venda = await _query(_sb.from('vendas').insert({ ...dados, id_loja: _idLoja() }).select().single());
      const numero = _numero(venda.id);

      // 2. Atualizar com numero
      await _sb.from('vendas').update({ numero }).eq('id', venda.id);
      venda.numero = numero;

      // 3. Inserir itens + movimentações (serviços não movimentam estoque)
      for (const item of itens) {
        await _query(_sb.from('venda_itens').insert({
          venda_id: venda.id,
          produto_id: item.produto_id || null,
          servico_id: item.servico_id || null,
          servico_nome: item.servico_nome || null,
          tipo: item.tipo || 'produto',
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          id_loja: _idLoja()
        }));
        if (!item.tipo || item.tipo === 'produto') {
          await DB.Movimentacoes.salvar({
            produto_id: item.produto_id,
            tipo: 'saida',
            quantidade: item.quantidade,
            motivo: `Venda #${numero}`,
            usuario_id: dados.vendedor_id,
            data: dados.data || new Date().toISOString()
          });
        }
      }

      // 4. Criar cobranças para parcelas pendentes
      // Vendas em carnê NÃO geram cobranças: o carnê controla as próprias
      // parcelas (a tela de cobranças exibe as parcelas do carnê diretamente)
      if (dados.forma_pagamento !== 'carne') {
        for (const p of (dados.parcelas || [])) {
          if (!p.pago) {
            await DB.Cobrancas.salvar({
              venda_id: venda.id,
              numero_venda: numero,
              cliente: dados.cliente_nome || dados.cliente,
              cliente_id: dados.cliente_id || null,
              parcela_num: p.numero,
              valor: p.valor,
              vencimento: p.vencimento,
              pago: false
            });
          }
        }
      }

      return venda;
    },
    async cancelar(id) {
      const venda = await this.porId(id);
      if (!venda) return;

      for (const item of (venda.venda_itens || [])) {
        if (!item.tipo || item.tipo === 'produto') {
          await DB.Movimentacoes.salvar({
            produto_id: item.produto_id,
            tipo: 'entrada',
            quantidade: item.quantidade,
            motivo: `Cancelamento venda #${venda.numero}`,
            data: new Date().toISOString()
          });
        }
      }

      await _sb.from('cobrancas').delete().eq('venda_id', id).eq('pago', false);
      await _query(_sb.from('vendas').update({ status: 'cancelada' }).eq('id', id));
    },
    async registrarTroca(vendaOriginalId, itensDevolver, itensLevar, obs) {
      const vendaOriginal = vendaOriginalId ? await this.porId(vendaOriginalId) : null;
      const refLabel = vendaOriginal ? `venda #${vendaOriginal.numero}` : 'carnê';

      // 1. Devolver itens ao estoque (entrada)
      for (const item of itensDevolver) {
        if (item.produto_id && item.quantidade > 0) {
          await DB.Movimentacoes.salvar({
            produto_id: item.produto_id,
            tipo: 'entrada',
            quantidade: item.quantidade,
            motivo: `Troca - Devolução ref. ${refLabel}`,
            data: new Date().toISOString()
          });
        }
      }

      // 2. Criar nova venda com os novos itens (gera saídas de estoque automaticamente)
      const totalDevolvido = itensDevolver.reduce((s, i) => s + (i.preco_unitario * i.quantidade), 0);
      const totalNovo = itensLevar.reduce((s, i) => s + (i.preco_unitario * i.quantidade), 0);
      const diferenca = totalNovo - totalDevolvido;

      const novaVenda = await this.salvar({
        cliente: vendaOriginal?.cliente || null,
        cliente_nome: vendaOriginal?.cliente_nome || null,
        cliente_id: vendaOriginal?.cliente_id || null,
        data: new Date().toISOString(),
        itens: itensLevar.map(i => ({ ...i, tipo: 'produto' })),
        subtotal: totalNovo,
        desconto: Math.max(-diferenca, 0),
        total: Math.max(diferenca, 0),
        forma_pagamento: 'troca',
        num_parcelas: 1,
        parcelas: [{ numero: 1, valor: Math.max(diferenca, 0), vencimento: hoje(), pago: diferenca <= 0 }],
        status_pgto: diferenca <= 0 ? 'pago' : 'pendente',
        status: 'ativa',
        origem: 'troca',
        observacoes: `Troca ref. ${refLabel}${obs ? '. ' + obs : ''}`,
        vendedor_id: Auth.usuario()?.id,
        vendedor_nome: Auth.usuario()?.nome
      });

      // 3. Anotar na venda original (se houver)
      if (vendaOriginal) {
        const obsAtual = vendaOriginal.observacoes || '';
        const novaObs = obsAtual
          ? obsAtual + ` | Troca: nova venda #${novaVenda.numero}`
          : `Troca realizada: nova venda #${novaVenda.numero}`;
        await _query(_sb.from('vendas').update({ observacoes: novaObs }).eq('id', vendaOriginalId));
      }

      return { novaVenda, totalDevolvido, totalNovo, diferenca };
    }
  },

  // ===== COMPRAS =====
  Compras: {
    async todas() {
      return await _query(_sb.from('compras').select('*, compra_itens(*)').eq('id_loja', _idLoja()).order('data', { ascending: false }));
    },
    async porId(id) {
      const { data } = await _sb.from('compras').select('*, compra_itens(*)').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async filtrar(filtros = {}) {
      let q = _sb.from('compras').select('*, compra_itens(*)').eq('id_loja', _idLoja()).order('data', { ascending: false });
      if (filtros.dataInicio) q = q.gte('data', filtros.dataInicio);
      if (filtros.dataFim)    q = q.lte('data', filtros.dataFim + 'T23:59:59');
      if (filtros.busca) q = q.or(`numero.ilike.%${filtros.busca}%,fornecedor.ilike.%${filtros.busca}%`);
      return await _query(q);
    },
    async doMes(ano, mes) {
      const inicio = `${ano}-${String(mes+1).padStart(2,'0')}-01`;
      const fim = new Date(ano, mes+1, 0).toISOString().split('T')[0];
      return await _query(_sb.from('compras').select('*').eq('id_loja', _idLoja()).gte('data', inicio).lte('data', fim + 'T23:59:59'));
    },
    async salvar(dados) {
      const itens = dados.itens || [];
      delete dados.itens;

      const compra = await _query(_sb.from('compras').insert({ ...dados, id_loja: _idLoja() }).select().single());
      const numero = _numero(compra.id, 'C');
      await _sb.from('compras').update({ numero }).eq('id', compra.id);
      compra.numero = numero;

      for (const item of itens) {
        await _query(_sb.from('compra_itens').insert({
          compra_id: compra.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          custo_unitario: item.custo_unitario,
          id_loja: _idLoja()
        }));
        await DB.Movimentacoes.salvar({
          produto_id: item.produto_id,
          tipo: 'entrada',
          quantidade: item.quantidade,
          motivo: `Compra #${numero} - ${dados.fornecedor}`,
          custo_unitario: item.custo_unitario,
          data: dados.data || new Date().toISOString()
        });
      }

      return compra;
    }
  },

  // ===== COBRANÇAS =====
  Cobrancas: {
    async todas() {
      return await _query(_sb.from('cobrancas').select('*').eq('id_loja', _idLoja()).order('vencimento'));
    },
    async porId(id) {
      const { data } = await _sb.from('cobrancas').select('*').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async pendentes() {
      return await _query(_sb.from('cobrancas').select('*').eq('id_loja', _idLoja()).eq('pago', false).order('vencimento'));
    },
    async vencidas() {
      return await _query(_sb.from('cobrancas').select('*').eq('id_loja', _idLoja()).eq('pago', false).lt('vencimento', hoje()).order('vencimento'));
    },
    async aVencer(dias = 7) {
      const lim = addDias(hoje(), dias);
      return await _query(_sb.from('cobrancas').select('*').eq('id_loja', _idLoja()).eq('pago', false).gte('vencimento', hoje()).lte('vencimento', lim).order('vencimento'));
    },
    async filtrar(filtros = {}) {
      let q = _sb.from('cobrancas').select('*').eq('id_loja', _idLoja());
      if (filtros.pago !== undefined) q = q.eq('pago', filtros.pago);
      if (filtros.vencInicio) q = q.gte('vencimento', filtros.vencInicio);
      if (filtros.vencFim)    q = q.lte('vencimento', filtros.vencFim);
      if (filtros.busca) q = q.or(`cliente.ilike.%${filtros.busca}%,numero_venda.ilike.%${filtros.busca}%`);
      if (filtros.vencidas) q = q.eq('pago', false).lt('vencimento', hoje());
      return await _query(q.order('vencimento'));
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('cobrancas').update(dados).eq('id', id).select().single());
      }
      return await _query(_sb.from('cobrancas').insert({ ...dados, id_loja: _idLoja() }).select().single());
    },
    async registrarPagamento(id, dataPgto) {
      const dataPagamento = dataPgto || hoje();
      const cob = await this.porId(id);
      await _query(_sb.from('cobrancas').update({ pago: true, data_pagamento: dataPagamento }).eq('id', id));

      // Sincroniza a parcela correspondente na venda relacionada
      if (cob && cob.venda_id && cob.parcela_num) {
        const { data: venda } = await _sb.from('vendas').select('id, parcelas').eq('id', cob.venda_id).single();
        if (venda && Array.isArray(venda.parcelas)) {
          const parcelas = venda.parcelas.map(p =>
            p.numero === cob.parcela_num ? { ...p, pago: true, data_pagamento: dataPagamento } : p
          );
          const todasPagas = parcelas.every(p => p.pago);
          const upd = todasPagas ? { parcelas, status_pgto: 'pago' } : { parcelas };
          await _sb.from('vendas').update(upd).eq('id', cob.venda_id);
        }
      }
    },
    async deletar(id) {
      await _query(_sb.from('cobrancas').delete().eq('id', id));
    }
  },

  // ===== CARNÊS =====
  Carnes: {
    async todos() {
      return await _query(_sb.from('carnes').select('*').eq('id_loja', _idLoja()).order('criado_em', { ascending: false }));
    },
    async porId(id) {
      const { data } = await _sb.from('carnes').select('*').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async ativos() {
      return await _query(_sb.from('carnes').select('*').eq('id_loja', _idLoja()).not('status', 'in', '("quitado","cancelado")').order('criado_em', { ascending: false }));
    },
    async porCliente(clienteId) {
      return await _query(_sb.from('carnes').select('*').eq('id_loja', _idLoja()).eq('cliente_id', clienteId).order('criado_em', { ascending: false }));
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('carnes').update(dados).eq('id', id).select().single());
      }
      const carne = await _query(_sb.from('carnes').insert({ ...dados, status: 'aberto', id_loja: _idLoja() }).select().single());
      const numero = _numero(carne.id, 'CRN', 4);
      await _sb.from('carnes').update({ numero }).eq('id', carne.id);
      carne.numero = numero;
      return carne;
    },
    async pagarParcela(carneId, parcelaNum, dataPgto) {
      const carne = await this.porId(carneId);
      if (!carne) return;
      const parcelas = (carne.parcelas || []).map(p => {
        if (p.numero === parcelaNum) return { ...p, pago: true, data_pagamento: dataPgto || hoje() };
        return p;
      });
      const todasPagas = parcelas.every(p => p.pago);
      await _query(_sb.from('carnes').update({
        parcelas,
        status: todasPagas ? 'quitado' : 'aberto'
      }).eq('id', carneId));
    },
    async doMes(ano, mes) {
      const inicio = new Date(ano, mes, 1).toISOString().split('T')[0];
      const fim = new Date(ano, mes + 1, 0).toISOString().split('T')[0];
      return await _query(
        _sb.from('carnes').select('*').eq('id_loja', _idLoja())
          .neq('status', 'cancelado')
          .gte('criado_em', inicio)
          .lte('criado_em', fim + 'T23:59:59')
      );
    },
    async recentes(n = 5) {
      return await _query(
        _sb.from('carnes').select('*').eq('id_loja', _idLoja())
          .order('criado_em', { ascending: false }).limit(n)
      );
    }
  },

  // ===== ENCOMENDAS =====
  Encomendas: {
    async todas() {
      return await _query(_sb.from('encomendas').select('*').eq('id_loja', _idLoja()).order('criado_em', { ascending: false }));
    },
    async porId(id) {
      const { data } = await _sb.from('encomendas').select('*').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async abertas() {
      return await _query(_sb.from('encomendas').select('*').eq('id_loja', _idLoja()).not('status', 'in', '("entregue","cancelada")').order('criado_em', { ascending: false }));
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('encomendas').update(dados).eq('id', id).select().single());
      }
      const enc = await _query(_sb.from('encomendas').insert({ ...dados, status: dados.status || 'aguardando', id_loja: _idLoja() }).select().single());
      const numero = _numero(enc.id, 'ENC', 4);
      await _sb.from('encomendas').update({ numero }).eq('id', enc.id);
      enc.numero = numero;
      return enc;
    },
    async deletar(id) {
      await _query(_sb.from('encomendas').delete().eq('id', id));
    }
  },

  // ===== GASTOS =====
  Gastos: {
    async todos() {
      return await _query(_sb.from('gastos').select('*').eq('id_loja', _idLoja()).order('data', { ascending: false }));
    },
    async porId(id) {
      const { data } = await _sb.from('gastos').select('*').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async filtrar(filtros = {}) {
      let q = _sb.from('gastos').select('*').eq('id_loja', _idLoja()).order('data', { ascending: false });
      if (filtros.categoriaId) q = q.eq('categoria_id', filtros.categoriaId);
      if (filtros.dataInicio)  q = q.gte('data', filtros.dataInicio);
      if (filtros.dataFim)     q = q.lte('data', filtros.dataFim);
      if (filtros.busca) q = q.ilike('descricao', `%${filtros.busca}%`);
      return await _query(q);
    },
    async doMes(ano, mes) {
      const inicio = `${ano}-${String(mes+1).padStart(2,'0')}-01`;
      const fim = new Date(ano, mes+1, 0).toISOString().split('T')[0];
      return await _query(_sb.from('gastos').select('*').eq('id_loja', _idLoja()).gte('data', inicio).lte('data', fim));
    },
    async totalMes(ano, mes) {
      const lista = await this.doMes(ano, mes);
      return lista.reduce((s, g) => s + (g.valor || 0), 0);
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('gastos').update(dados).eq('id', id).select().single());
      }
      return await _query(_sb.from('gastos').insert({ ...dados, id_loja: _idLoja() }).select().single());
    },
    async deletar(id) {
      await _query(_sb.from('gastos').delete().eq('id', id));
    }
  },

  // ===== CATEGORIAS DE GASTOS =====
  CategoriasGastos: {
    async todas() {
      return await _query(_sb.from('categorias_gastos').select('*').eq('id_loja', _idLoja()).order('nome'));
    },
    async porId(id) {
      const { data } = await _sb.from('categorias_gastos').select('*').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    }
  },

  // ===== SERVIÇOS =====
  Servicos: {
    async todos() {
      return await _query(_sb.from('servicos').select('*').eq('id_loja', _idLoja()).order('nome'));
    },
    async ativos() {
      return await _query(_sb.from('servicos').select('*').eq('id_loja', _idLoja()).eq('ativo', true).order('nome'));
    },
    async porId(id) {
      const { data } = await _sb.from('servicos').select('*').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('servicos').update(dados).eq('id', id).select().single());
      }
      return await _query(_sb.from('servicos').insert({ ...dados, ativo: true, id_loja: _idLoja() }).select().single());
    },
    async deletar(id) {
      await _query(_sb.from('servicos').update({ ativo: false }).eq('id', id));
    }
  },

  // ===== AGENDAMENTOS =====
  Agendamentos: {
    async todos() {
      return await _query(_sb.from('agendamentos').select('*').eq('id_loja', _idLoja()).order('data', { ascending: false }).order('hora_inicio'));
    },
    async porData(data) {
      return await _query(_sb.from('agendamentos').select('*').eq('id_loja', _idLoja()).eq('data', data).order('hora_inicio'));
    },
    async porPeriodo(inicio, fim) {
      return await _query(_sb.from('agendamentos').select('*').eq('id_loja', _idLoja()).gte('data', inicio).lte('data', fim).order('data').order('hora_inicio'));
    },
    async porId(id) {
      const { data } = await _sb.from('agendamentos').select('*').eq('id_loja', _idLoja()).eq('id', id).single();
      return data;
    },
    async salvar(dados) {
      if (dados.id) {
        const id = dados.id; delete dados.id;
        return await _query(_sb.from('agendamentos').update(dados).eq('id', id).select().single());
      }
      const ag = await _query(_sb.from('agendamentos').insert({ ...dados, id_loja: _idLoja() }).select().single());
      const numero = _numero(ag.id, 'AGD', 4);
      await _sb.from('agendamentos').update({ numero }).eq('id', ag.id);
      ag.numero = numero;
      return ag;
    },
    async atualizarStatus(id, status) {
      await _query(_sb.from('agendamentos').update({ status }).eq('id', id));
    },
    async deletar(id) {
      await _query(_sb.from('agendamentos').delete().eq('id', id));
    }
  },

  // ===== RELATÓRIOS =====
  Relatorios: {
    async dashboardResumo() {
      const agora = new Date();
      const ano = agora.getFullYear();
      const mes = agora.getMonth();

      const [vendasMes, comprasMes, gastosMes, cobrancasPend, cobrancasVenc,
             produtos, estBaixo, clientes, funcionarios, encAbertas, carnesAtivos,
             vendasRec, movRec, carnesMes, carnesRec] = await Promise.all([
        DB.Vendas.doMes(ano, mes),
        DB.Compras.doMes(ano, mes),
        DB.Gastos.doMes(ano, mes),
        DB.Cobrancas.pendentes(),
        DB.Cobrancas.vencidas(),
        DB.Produtos.ativos(),
        DB.Produtos.comEstoqueBaixo(5),
        DB.Clientes.ativos(),
        DB.Funcionarios.ativos(),
        DB.Encomendas.abertas(),
        DB.Carnes.ativos(),
        DB.Vendas.recentes(5),
        DB.Movimentacoes.recentes(5),
        DB.Carnes.doMes(ano, mes),
        DB.Carnes.recentes(5)
      ]);

      const vendasMesAtivas = vendasMes.filter(v => v.status !== 'cancelada' && v.forma_pagamento !== 'carne');
      const vendasRecFiltradas = (vendasRec || []).filter(v => v.forma_pagamento !== 'carne');
      const carnesFormatados = (carnesRec || []).map(c => ({
        numero: c.numero,
        cliente_nome: c.cliente_nome || c.cliente || 'Consumidor',
        total: c.valor_total || 0,
        status_pgto: c.status === 'quitado' ? 'pago' : 'pendente',
        _tipo: 'carne'
      }));

      return {
        totalVendasMes: vendasMesAtivas.reduce((s, v) => s + (v.total || 0), 0)
                      + (carnesMes || []).reduce((s, c) => s + (c.valor_total || 0), 0),
        qtdVendasMes: vendasMesAtivas.length + (carnesMes || []).length,
        totalComprasMes: comprasMes.reduce((s, c) => s + (c.total || 0), 0),
        totalGastosMes: gastosMes.reduce((s, g) => s + (g.valor || 0), 0),
        totalReceber: cobrancasPend.reduce((s, c) => s + (c.valor || 0), 0),
        qtdCobrancasPendentes: cobrancasPend.length,
        qtdCobrancasVencidas: cobrancasVenc.length,
        totalVencido: cobrancasVenc.reduce((s, c) => s + (c.valor || 0), 0),
        totalProdutos: produtos.length,
        estoqueBaixo: estBaixo.length,
        estoqueBaixoLista: estBaixo.slice(0, 6),
        totalClientes: clientes.length,
        totalFuncionarios: funcionarios.length,
        encomendasAbertas: encAbertas.length,
        carnesAtivos: carnesAtivos.length,
        vendasRecentes: [...vendasRecFiltradas, ...carnesFormatados].slice(0, 10),
        movRecentes: movRec
      };
    },

    async vendasPorPeriodo(dataInicio, dataFim) {
      return await DB.Vendas.filtrar({ dataInicio, dataFim });
    }
  }
};
