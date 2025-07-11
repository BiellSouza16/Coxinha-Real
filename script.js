const salgadosLista = [
  "Coxinha (Frango)", "Palitinho (Queijo com Presunto)", "Balãozinho (Frango com Requeijão)",
  "Travesseirinho (Carne)", "Kibe de Queijo", "Kibe de Carne",
  "Churros de Doce de Leite", "Churros de Chocolate",
  "Enroladinho de Salsicha", "Boliviano (Carne)"
];

const bebidas = [
  { nome: "Guaraná 200ml", preco: 3 },
  { nome: "Pepsi 200ml", preco: 3 },
  { nome: "Guaraná Lata 350ml", preco: 4 },
  { nome: "Pepsi Lata 350ml", preco: 4 },
  { nome: "Água Mineral", preco: 2 },
  { nome: "Água com Gás", preco: 3 },
  { nome: "Guaraná 1L", preco: 7 },
  { nome: "Pepsi 1L", preco: 7 },
  { nome: "IT Guaraná 2L", preco: 8 },
  { nome: "IT Cola 2L", preco: 8 },
];

const combos = [
  { nome: "Combo A Dois", opcoes: [
    { titulo: "Sem refri", preco: 20, qtd: 25 },
    { titulo: "Com 2x refri de 200ml", preco: 24, qtd: 25, refri: 2, tamanhos: ["200ml"] }
  ]},
  { nome: "Combo Grupinho", opcoes: [
    { titulo: "Sem refri", preco: 35, qtd: 50 },
    { titulo: "Com 1 refri de 1L", preco: 40, qtd: 50, refri: 1, tamanhos: ["1L"] }
  ]},
  { nome: "Combo Galera", opcoes: [
    { titulo: "Sem refri", preco: 65, qtd: 100 },
    { titulo: "Com 1 refri de 2L", preco: 70, qtd: 100, refri: 1, tamanhos: ["2L", "IT"] }
  ]},
];
function alterarQtd(botao, delta, comboId) {
  const qtdSpan = botao.parentElement.querySelector('span[data-qtd]');
  let qtdAtual = parseInt(qtdSpan.dataset.qtd);

  if (!comboId) {
    // Produtos avulsos (fora dos combos)
    qtdAtual += delta;
    if (qtdAtual < 0) qtdAtual = 0;
    qtdSpan.dataset.qtd = qtdAtual;
    qtdSpan.textContent = qtdAtual;
    atualizar();
    return;
  }

  // Extrai o nome do combo e o título da opção
  const isRefri = comboId.includes('-refri');
const baseId = isRefri ? comboId.replace('-refri', '') : comboId;
const [comboBase, opcaoTitulo] = baseId.split(' – ');
  const comboObj = combos.find(c => c.nome === comboBase);
  const opcaoObj = comboObj?.opcoes.find(o => o.titulo === opcaoTitulo);
  if (!comboObj || !opcaoObj) {
    qtdAtual += delta;
    if (qtdAtual < 0) qtdAtual = 0;
    qtdSpan.dataset.qtd = qtdAtual;
    qtdSpan.textContent = qtdAtual;
    atualizar();
    return;
  }

  const multInput = document.querySelector(`input[data-combo-mult="${comboBase} – ${opcaoTitulo}"]`);
  const multiplicador = multInput ? Math.max(1, parseInt(multInput.value)) : 1;

  // Coleta todos os spans do combo (salgados ou refri)
  const spansCombo = document.querySelectorAll(`span[data-combo='${comboId}']`);
  let soma = 0;
  spansCombo.forEach(span => {
    soma += parseInt(span.dataset.qtd);
  });

  const limite = isRefri
    ? (opcaoObj.refri || 0) * multiplicador
    : (opcaoObj.qtd || 0) * multiplicador;

  if (delta > 0 && soma >= limite) {
    const box = document.querySelector(`[data-combo-box='${comboBase} – ${opcaoTitulo}']`);
    if (box) {
      box.classList.add('erro-combo');
      setTimeout(() => box.classList.remove('erro-combo'), 800);
    }
    return;
  }

  qtdAtual += delta;
  if (qtdAtual < 0) qtdAtual = 0;
  qtdSpan.dataset.qtd = qtdAtual;
  qtdSpan.textContent = qtdAtual;
  atualizar();
}

function criarBloco(id, itens, precoFixo = 1) {
  const container = document.getElementById(id);
  itens.forEach(item => {
    const preco = item.preco || precoFixo;
    const nome = item.nome || item;
    const texto = (id === 'bebidas') ? `${nome} (R$${preco.toFixed(2)})` : nome;
    const box = document.createElement('div');
    box.className = 'card-box';
    box.innerHTML = `
  <div class="item">
    <span>${texto}</span>
    <div class="quantidade">
      <input type="number" min="0" value="0" data-nome="${nome}" data-preco="${preco}" data-qtd="0">
    </div>
  </div>`;
    container.appendChild(box);
  });
}

function criarCombos() {
  const container = document.getElementById('combos');
  combos.forEach(combo => {
    combo.opcoes.forEach(opcao => {
      const idCombo = `${combo.nome} – ${opcao.titulo}`;
      const box = document.createElement('div');
      box.className = 'card-box';
      box.setAttribute('data-combo-box', idCombo);

      // Primeiro monta o conteúdo base no innerHTML
      box.innerHTML = `
        <div class="combo-title">${combo.nome} – ${opcao.titulo}</div>
        <div class="combo-sub">${opcao.qtd} mini salgados – R$${opcao.preco.toFixed(2)}</div>
        <label>Quantidade de combos:
          <input type="number" min="1" value="1" data-combo-mult="${idCombo}" style="width:50px; margin-left:10px;">
        </label>
        <div class="combo-actions">
          <button class="limpar-combo" onclick="limparCombo('${idCombo}')">Limpar Combo</button>
        </div>
      `;

      // Depois adiciona a div de mensagem de erro para avisos visuais
      const mensagemErro = document.createElement('div');
      mensagemErro.className = 'mensagem-erro';
      box.appendChild(mensagemErro);

      // Adiciona os sabores dos salgados
      const saboresDiv = document.createElement('div');
      saboresDiv.className = 'sabores';
      saboresDiv.innerHTML = salgadosLista.map(sabor => `
        <div class="item">
          <span>${sabor}</span>
          <div class="quantidade">
  <input type="number" min="0" value="0" data-nome="${sabor}" data-preco="0" data-qtd="0" data-combo="${idCombo}">
</div>
        </div>`).join('');
      box.appendChild(saboresDiv);

      // Se a opção tiver refrigerante, adiciona a área para escolher refri
      if (opcao.refri) {
        const refriDiv = document.createElement('div');
        refriDiv.classList.add('refri-area');
        refriDiv.innerHTML = `<strong class="refri-titulo">Escolha os refrigerantes:</strong>`;
        bebidas.filter(b => opcao.tamanhos.some(t => b.nome.includes(t))).forEach(b => {
          const linha = document.createElement('div');
          linha.className = 'item';
          linha.innerHTML = `
            <span>${b.nome}</span>
            <div class="quantidade">
  <input type="number" min="0" value="0" data-nome="${b.nome}" data-preco="0" data-qtd="0" data-combo="${idCombo}-refri">
</div>
          `;
          refriDiv.appendChild(linha);
        });
        box.appendChild(refriDiv);
      }

      container.appendChild(box);
    });
  });
}

function limparCombo(comboId) {
  const inputs = document.querySelectorAll(`input[data-combo='${comboId}'], input[data-combo='${comboId}-refri']`);
  inputs.forEach(input => {
    input.value = 0;
    input.dataset.qtd = 0;
  });
  atualizar();

  const box = document.querySelector(`[data-combo-box="${comboId}"]`);
  if (box) {
    const msg = box.querySelector('.mensagem-erro');
    if (msg) msg.style.display = 'none';
  }


}

function pegarDataHora() {
  const data = document.getElementById('dataRetirada').value;
  const hora = document.getElementById('horaRetirada').value;
  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0];
  if (!data || !hora) return '';
  if (data === hojeStr) {
    return `Para hoje às ${hora}`;
  } else {
    const partes = data.split('-');
    return `Para dia ${partes[2]}/${partes[1]} às ${hora}`;
  }
}

// 👉 Parte final virá em seguida com a função atualizar completa
// que inclui os destaques visuais e o novo resumo com data/hora
// script.js (final - atualização completa)

function atualizar() {
  const spans = document.querySelectorAll('[data-nome]');
spans.forEach(el => {
  let qtd = parseInt(el.value || el.textContent || '0');
  el.dataset.qtd = qtd;
});
  const lista = document.getElementById('lista');
  const nomeCliente = document.getElementById('nomeCliente').value.trim();
  const pagamentoConfirmado = document.getElementById('checkboxPagamento')?.checked;
  const totalEl = document.getElementById('total');
  const dataHora = pegarDataHora();

  let total = 0;
  let text = '';
  const combosAgrupados = {};
  let avulsos = '';
  const combosUsados = new Set();
  const multiplicadores = {};

  document.querySelectorAll('input[data-combo-mult]').forEach(input => {
    multiplicadores[input.dataset.comboMult] = Math.max(1, parseInt(input.value));
  });

  spans.forEach(el => {
    const qtd = parseInt(el.dataset.qtd);
    if (qtd > 0) {
      const nome = el.dataset.nome;
      const preco = parseFloat(el.dataset.preco);
      const combo = el.dataset.combo;
      if (combo) {
        if (!combosAgrupados[combo]) combosAgrupados[combo] = [];
        combosAgrupados[combo].push({ nome, qtd });
        combosUsados.add(combo.replace('-refri',''));
      } else {
        total += preco * qtd;
        let nomeFormatado = nome;
if (!/Kibe|Churros/i.test(nome)) {
  nomeFormatado = nome.replace(/\s*\(.*?\)/g, '').trim();
}
avulsos += `${qtd} ${nomeFormatado}\n`;
      }
    }
  });

  const combosAdicionados = new Set();
  Object.entries(combosAgrupados).forEach(([combo, itens]) => {
    const comboKey = combo.replace('-refri','');
    const comboData = combos.flatMap(c => c.opcoes.map(o => ({...o, combo: `${c.nome} – ${o.titulo}`})))
      .find(c => c.combo === comboKey);
    const mult = multiplicadores[comboKey] || 1;
    if (!combo.includes('-refri') && !combosAdicionados.has(comboKey)) {
      text += `\n${mult}x ${comboKey}\n`;
      total += comboData.preco * mult;
      combosAdicionados.add(comboKey);
    }
    itens.forEach(({ nome, qtd }) => {
  // Mantém sabor apenas em Kibe e Churros
  let nomeFormatado = nome;
  if (!/Kibe|Churros/i.test(nome)) {
    nomeFormatado = nome.replace(/\s*\(.*?\)/g, '').trim();
  }
  text += `- ${qtd} ${nomeFormatado}\n`;
});
  });

  if (avulsos) {
    text += `\nSalgados Avulsos:\n${avulsos}`;
  }

  lista.textContent = text || '(nenhum item)';
  totalEl.textContent = `Total: R$${total.toFixed(2)}`;

  let resumo = `👤Resumo do pedido de: ${nomeCliente}\n\n`;

Object.entries(combosAgrupados).forEach(([comboKey, itens]) => {
  const isRefri = comboKey.includes('-refri');
  if (isRefri) return;

  const baseKey = comboKey;
  const mult = multiplicadores[baseKey] || 1;
  const comboData = combos.flatMap(c => c.opcoes.map(o => ({ ...o, combo: `${c.nome} – ${o.titulo}` })))
    .find(c => c.combo === baseKey);

  const [comboNome, comboTitulo] = baseKey.split(' – ');
resumo += `🍱${comboNome} - ${comboTitulo} - R$${(comboData.preco * mult).toFixed(2)}\n`;

  itens.forEach(({ nome, qtd }) => {
    const nomeLimpo = nome.split('(')[0].trim();
    resumo += `  - ${qtd} ${nomeLimpo}\n`;
  });

  if (temRefri) {
    const refriItens = combosAgrupados[`${baseKey}-refri`] || [];
    if (refriItens.length > 0) {
      const nomesRefri = refriItens.map(r => r.nome).join(', ');
      resumo += `  - Refri: ${nomesRefri}\n`;
    }
  }

  resumo += '\n';
});

// Salgados avulsos
const avulsosSelecionados = Array.from(spans)
  .filter(el => !el.dataset.combo && parseInt(el.dataset.qtd) > 0)
  .map(el => ({
    nome: el.dataset.nome.split('(')[0].trim(),
    qtd: parseInt(el.dataset.qtd)
  }));

if (avulsosSelecionados.length > 0) {
  resumo += `🍱Salgados de R$1,00\n`;
  avulsosSelecionados.forEach(({ nome, qtd }) => {
    resumo += `  - ${qtd} ${nome}\n`;
  });
  resumo += '\n';
}

// Data e total
resumo += `📅 _${dataHora}_\n\n`;
resumo += `Valor Total = *💰R$${total.toFixed(2)}💰*\n\n`;
resumo += `*📌RETIRADA NA LOJA 01 AO LADO DO BUDEGÃO SUPERMERCADO*`;
  const refriOk = Array.from(combosUsados).every(comboKey => {
  const comboData = combos.flatMap(c => c.opcoes.map(o => ({ ...o, combo: `${c.nome} – ${o.titulo}` })))
    .find(c => c.combo === comboKey);
  const mult = multiplicadores[comboKey] || 1;

  // Se o combo NÃO tiver refrigerante, está OK
  if (!comboData?.refri) return true;

  const refriComboKey = `${comboKey}-refri`;
  const totalRefri = (combosAgrupados[refriComboKey] || []).reduce((sum, { qtd }) => sum + qtd, 0);
  const esperado = (comboData.refri || 0) * mult;

  return totalRefri === esperado;
});

  const salgadosOk = Array.from(combosUsados).every(comboKey => {
    const salgados = Object.entries(combosAgrupados)
      .filter(([combo]) => combo.replace('-refri','') === comboKey && !combo.includes('-refri'))
      .flatMap(([, itens]) => itens);
    const comboData = combos.flatMap(c => c.opcoes.map(o => ({...o, combo: `${c.nome} – ${o.titulo}`})))
      .find(c => c.combo === comboKey);
    const totalSalgados = salgados.reduce((sum, {qtd}) => sum + qtd, 0);
    const mult = multiplicadores[comboKey] || 1;
    return totalSalgados === (comboData?.qtd || 0) * mult;
  });

  const botao = document.getElementById('whatsapp-btn');

  document.querySelectorAll('[data-combo-box]').forEach(box => {
    box.classList.remove('erro-combo');
  });

Object.keys(combosAgrupados).forEach(comboKey => {
  const baseKey = comboKey.replace('-refri', '');
  const box = document.querySelector(`[data-combo-box='${baseKey}']`);
  if (!box) return;

  const isRefriCombo = combos.some(c =>
    c.opcoes.some(o => `${c.nome} – ${o.titulo}` === baseKey && o.refri)
  );

  const salgados = Object.entries(combosAgrupados)
  .filter(([combo]) => combo.replace('-refri', '') === baseKey && !combo.includes('-refri'))
  .flatMap(([, itens]) => itens)
  .filter(item => item.qtd > 0);

  const refri = Object.entries(combosAgrupados)
    .filter(([combo]) => combo === `${baseKey}-refri`)
    .flatMap(([, itens]) => itens);

  const comboData = combos.flatMap(c => c.opcoes.map(o => ({ ...o, combo: `${c.nome} – ${o.titulo}` })))
    .find(c => c.combo === baseKey);

  const mult = multiplicadores[baseKey] || 1;
  const totalSalgados = salgados.reduce((sum, { qtd }) => sum + qtd, 0);
  const totalEsperadoSalg = (comboData?.qtd || 0) * mult;
  const totalRefri = refri.reduce((sum, { qtd }) => sum + qtd, 0);
  const totalEsperadoRefri = (comboData?.refri || 0) * mult;

  const mensagemDiv = box.querySelector('.mensagem-erro');

  if (totalSalgados === 0) {
  mensagemDiv.style.display = 'none';
} else if (totalSalgados < totalEsperadoSalg) {
  mensagemDiv.textContent = `Faltam ${totalEsperadoSalg - totalSalgados} mini salgados para completar o combo.`;
  mensagemDiv.style.display = 'block';
} else if (isRefriCombo && totalRefri < totalEsperadoRefri) {
  mensagemDiv.textContent = `Faltam ${totalEsperadoRefri - totalRefri} refrigerantes para completar o combo.`;
  mensagemDiv.style.display = 'block';
} else {
  mensagemDiv.style.display = 'none';
}
});

  if (!nomeCliente || !salgadosOk || !refriOk || !pagamentoConfirmado) {
    botao.href = '#';
    botao.style.pointerEvents = 'none';
    botao.style.opacity = 0.5;
    botao.classList.remove('pronto');

    if (!nomeCliente) {
      lista.textContent = 'Por favor, digite seu nome para continuar.';
    } else if (!salgadosOk) {
      lista.textContent = 'Preencha corretamente a quantidade de salgados em cada combo.';
    } else if (!refriOk) {
      lista.textContent = 'Preencha corretamente os refrigerantes nos combos com bebida.';
    } else if (!pagamentoConfirmado) {
      lista.textContent = 'Você deve marcar a confirmação de pagamento de 50% para prosseguir.';
    }

    // Destaque visual para combos com refrigerantes incompletos
    if (!refriOk) {
      Object.keys(combosAgrupados).forEach(comboKey => {
        if (comboKey.includes('-refri')) {
          const baseKey = comboKey.replace('-refri', '');
          const box = document.querySelector(`[data-combo-box='${baseKey}']`);
          const mensagemDiv = box?.querySelector('.mensagem-erro');
          const comboData = combos.flatMap(c => c.opcoes.map(o => ({...o, combo: `${c.nome} – ${o.titulo}`})))
            .find(c => c.combo === baseKey);
          const mult = multiplicadores[baseKey] || 1;
          const esperado = (comboData?.refri || 0) * mult;

          const total = (combosAgrupados[comboKey] || []).reduce((sum, item) => sum + item.qtd, 0);
          const faltam = esperado - total;

          if (box && faltam > 0) {
            box.classList.add('erro-combo');
            if (mensagemDiv) {
              mensagemDiv.textContent = `Faltam ${faltam} refrigerantes para completar o combo.`;
              mensagemDiv.style.display = 'block';
            }
          }
        }
      });
    }

    return; // <-- termina aqui se estiver com erro
  }

  // ✅ Caso tudo esteja correto, libera o botão de WhatsApp
  if (!text.trim()) {
  lista.textContent = 'Adicione pelo menos um item ao pedido.';
  botao.href = '#';
  botao.style.pointerEvents = 'none';
  botao.style.opacity = 0.5;
  botao.classList.remove('pronto');
  const botaoWhatsapp = document.getElementById('whatsapp-btn');
const modal = document.getElementById('modalConfirmacao');
const confirmarEnvio = document.getElementById('confirmarEnvio');
const cancelarEnvio = document.getElementById('cancelarEnvio');

let linkFinalWhatsApp = '';

botaoWhatsapp.addEventListener('click', function(e) {
  if (!botaoWhatsapp.classList.contains('pronto')) return;
  e.preventDefault(); // Impede envio imediato
  linkFinalWhatsApp = botaoWhatsapp.href;
  modal.style.display = 'flex';
});

confirmarEnvio.addEventListener('click', function() {
  modal.style.display = 'none';
  window.open(linkFinalWhatsApp, '_blank');
});

cancelarEnvio.addEventListener('click', function() {
  modal.style.display = 'none';
});
  return;
}
  botao.href = `https://wa.me/5573981741968?text=${encodeURIComponent(resumo)}`;
  botao.style.pointerEvents = 'auto';
  botao.style.opacity = 1;
  botao.classList.add('pronto');
}

document.getElementById('nomeCliente').addEventListener('input', atualizar);
document.getElementById('dataRetirada').addEventListener('change', atualizar);
document.getElementById('horaRetirada').addEventListener('change', atualizar);
document.addEventListener('input', atualizar);
document.querySelectorAll('input[data-combo-mult]').forEach(input => {
  input.addEventListener('input', () => {
    const comboKey = input.dataset.comboMult;
    const comboData = combos.flatMap(c => c.opcoes.map(o => ({ ...o, combo: `${c.nome} – ${o.titulo}` })))
      .find(c => c.combo === comboKey);

    const mult = Math.max(1, parseInt(input.value));
    const box = document.querySelector(`[data-combo-box='${comboKey}']`);
    if (!comboData || !box) return;

    // Conta os salgados e refri atuais
    const spansSalgados = document.querySelectorAll(`span[data-combo='${comboKey}']`);
    const totalSalgados = Array.from(spansSalgados).reduce((sum, el) => sum + parseInt(el.dataset.qtd), 0);

    const esperadoSalg = (comboData.qtd || 0) * mult;

    if (totalSalgados > esperadoSalg) {
      box.classList.add('erro-combo');
      setTimeout(() => box.classList.remove('erro-combo'), 600);
    }

    if (comboData.refri) {
      const spansRefri = document.querySelectorAll(`span[data-combo='${comboKey}-refri']`);
      const totalRefri = Array.from(spansRefri).reduce((sum, el) => sum + parseInt(el.dataset.qtd), 0);
      const esperadoRefri = comboData.refri * mult;

      if (totalRefri > esperadoRefri) {
        box.classList.add('erro-combo');
        setTimeout(() => box.classList.remove('erro-combo'), 600);
      }
    }
  });
});
document.getElementById('checkboxPagamento').addEventListener('change', atualizar);

criarBloco('salgados', salgadosLista);
criarBloco('bebidas', bebidas);
criarCombos();
atualizar();

document.addEventListener('input', e => {
  const input = e.target;
  if (!input.matches('input[data-nome]')) return;

  const comboId = input.dataset.combo;
  const nome = input.dataset.nome;
  const isRefri = comboId?.endsWith('-refri');
  const baseId = comboId?.replace('-refri', '');

  if (!comboId) return; // Se não for combo, sai

  const comboData = combos.flatMap(c =>
    c.opcoes.map(o => ({
      ...o,
      combo: `${c.nome} – ${o.titulo}`,
    }))
  ).find(c => c.combo === baseId);

  if (!comboData) return;

  const multInput = document.querySelector(`input[data-combo-mult="${baseId}"]`);
  const mult = multInput ? Math.max(1, parseInt(multInput.value)) : 1;

  const limite = isRefri
    ? (comboData.refri || 0) * mult
    : (comboData.qtd || 0) * mult;

  const inputsDoGrupo = document.querySelectorAll(`input[data-combo="${comboId}"]`);
  let soma = 0;
  inputsDoGrupo.forEach(el => {
    soma += parseInt(el.value || 0);
  });

  if (soma > limite) {
    // Reverte o último campo para não ultrapassar
    const excedente = soma - limite;
    const atual = parseInt(input.value || 0);
    input.value = Math.max(0, atual - excedente);
    input.dataset.qtd = input.value;

    // Piscar borda vermelha
    const box = document.querySelector(`[data-combo-box='${baseId}']`);
    if (box) {
      box.classList.add('erro-combo');
      setTimeout(() => box.classList.remove('erro-combo'), 800);
    }

    atualizar(); // Atualiza novamente com o valor corrigido
  }
});

window.addEventListener('beforeunload', function (e) {
  // Verifica se tem algo selecionado no pedido
  const spans = document.querySelectorAll('[data-qtd]');
  let pedidoTemItens = false;
  spans.forEach(el => {
    if (parseInt(el.dataset.qtd) > 0) pedidoTemItens = true;
  });

  if (pedidoTemItens) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
  // Se não tiver nada, não mostra aviso
});
