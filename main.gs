function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}


// Abre o HTML quando o botão é clicado
function abrirAuditoria() {
  const html = HtmlService.createHtmlOutputFromFile('index.html')
    .setWidth(1400)
    .setHeight(1600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Auditoria de Outbound');
}

// Carrega os grupos de transportadoras da aba "DADOS"
function obterGruposTransportadoras() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('DADOS');
  const rangeGrupos = sheet.getRange('H2:H' + sheet.getLastRow()); // Coluna 'GRUPO DA TRANSPORTADORA'
  const grupos = [...new Set(rangeGrupos.getValues().flat().filter(nome => nome !== ''))];
  
  // Adiciona o grupo "GERAL" se ainda não estiver na lista
  if (!grupos.includes('GERAL')) {
    grupos.push('GERAL');
  }
  
  return grupos;
}

// Função para obter o mapeamento de grupos para transportadoras
function obterMapeamentoGruposTransportadoras() {
  // Definição manual do mapeamento de grupos para transportadoras
  const mapeamento = {
    'Azul': ['Azul'],
    'Correios': ['Correios', 'Sedex'],
    'Favorita': ['Favorita'],
    'GFL': ['GFL', 'MAGALOG', 'FATELOG'],
    'JeT Express': ['JeT Express'],
    'Rede Sul': ['Rede Sul'],
    'TMA': ['TMA Nordeste', 'TMA Sudeste'],
    'Total Express': ['Total Express', 'Total'],
    'JADLOG': ['JADLOG']
  };
  
  // Adiciona todas as transportadoras ao grupo "GERAL"
  mapeamento['GERAL'] = Object.values(mapeamento).flat();
  
  return mapeamento;
}

// Nova função para obter todos os dados da aba "DADOS" como JSON
function obterTodosOsDados() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('DADOS');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Criar um objeto com todos os dados organizados por Nota Fiscal
  const dadosJSON = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const notaFiscal = row[headers.indexOf('Nota Fiscal')];
    
    if (notaFiscal) {
      dadosJSON[notaFiscal] = {
        notaFiscal: notaFiscal,
        pedido: row[headers.indexOf('Número Pedido')],
        peso: row[headers.indexOf('Peso')],
        volumes: row[headers.indexOf('Qtd volumes')],
        transportadora: row[headers.indexOf('Transportadoras')],
        grupoTransportadora: row[headers.indexOf('GRUPO DA TRANSPORTADORA')],
        valor: row[headers.indexOf('Valor')]
      };
    }
  }
  
  return dadosJSON;
}

// Função para salvar dados na aba "LANÇA"
function salvarNaLancaTodos(bipados) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('LANÇA');

  const dataToSave = bipados.map(dados => [
    dados.notaFiscal, // Adicionando a nota fiscal no início do array
    dados.pedido,
    dados.peso,
    dados.volumes,
    dados.valor,
    dados.transportadora,
    dados.grupoTransportadoraSelecionado,
    // dados.grupoTransportadoraSelecionado || dados.grupoTransportadora
  ]);

  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, dataToSave.length, 7).setValues(dataToSave); // Ajustado para 7 colunas
  
  return true; // Para confirmar que os dados foram salvos
}



function pintarLancamento() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaVerificacao = ss.getSheetByName("VERIFICACAO");
  var abaLanca = ss.getSheetByName("LANÇA");

  var ultimaLinha = abaVerificacao.getLastRow();
  var valoresVerificacao = abaVerificacao.getRange("A2:A" + ultimaLinha).getValues();

  for (var i = 0; i < valoresVerificacao.length; i++) {
    var valor = valoresVerificacao[i][0];
    var linha = i + 2; // Porque começamos da linha 2

    var intervaloLanca = abaLanca.getRange("A" + linha + ":G" + linha);

    if (valor === "CERTO") {
      intervaloLanca.setBackground("#b6d7a8"); // Verde claro
    } else if (valor === "ERRADO") {
      intervaloLanca.setBackground("#f4cccc"); // Vermelho claro
    } else {
      intervaloLanca.setBackground(null); // Limpa a cor
    }
  }
}
