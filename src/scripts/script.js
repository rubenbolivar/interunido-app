/* script.js */

document.addEventListener('DOMContentLoaded', () => {
    const operationForm = document.getElementById('operationForm');
    const amountToSellInput = document.getElementById('amountToSell');
    const clientRateInput = document.getElementById('clientRate');
    const amountClientReceivesInput = document.getElementById('amountClientReceives');
    const proceedToStage2Btn = document.getElementById('proceedToStage2');
    const stage2 = document.getElementById('stage2');
    const addTransactionBtn = document.getElementById('addTransaction');
    const transactionsDiv = document.getElementById('transactions');
    const stage3 = document.getElementById('stage3');
    const resultsDiv = document.getElementById('results');
  
    let totalMonto = 0;
    let transactionCount = 0;
    let transactions = [];
    let montoQueDeseaVender = 0;
    let tasaCliente = 0;
    let tasaOficinaGlobal = null;
  
    // Formatear números según las reglas especificadas
    function formatNumber(num) {
      if (typeof num !== 'number') return num;
      return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  
    // Calcular Monto que debe recibir el cliente
    function calculateMontoClienteReceives() {
      const amountToSell = parseFloat(amountToSellInput.value) || 0;
      const clientRate = parseFloat(clientRateInput.value) || 0;
      const result = amountToSell * clientRate;
      amountClientReceivesInput.value = formatNumber(result);
    }
  
    amountToSellInput.addEventListener('input', calculateMontoClienteReceives);
    clientRateInput.addEventListener('input', calculateMontoClienteReceives);
  
    operationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      montoQueDeseaVender = parseFloat(amountToSellInput.value);
      tasaCliente = parseFloat(clientRateInput.value);
  
      if (!montoQueDeseaVender || !tasaCliente) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
      }
  
      stage2.style.display = 'block';
      proceedToStage2Btn.disabled = true;
  
      // Inicializar tabla de resultados
      stage3.style.display = 'block';
      updateResults();
    });
  
    addTransactionBtn.addEventListener('click', () => {
      transactionCount++;
      const transactionForm = document.createElement('div');
      transactionForm.classList.add('transaction-form');
      transactionForm.setAttribute('data-id', transactionCount);
  
      transactionForm.innerHTML = `
        <h3>Transacción ${transactionCount}</h3>
        <div class="form-group">
          <label for="operatorName${transactionCount}">Nombre del Operador:</label>
          <input type="text" id="operatorName${transactionCount}" required>
        </div>
        <div class="form-group">
          <label for="monto${transactionCount}">Monto:</label>
          <input type="number" id="monto${transactionCount}" min="0" step="any" required>
        </div>
        <div class="form-group">
          <label for="tasaVenta${transactionCount}">Tasa de Venta:</label>
          <input type="number" id="tasaVenta${transactionCount}" min="0" step="any" required>
        </div>
        <div class="form-group">
          <label for="tasaOficina${transactionCount}">Tasa Oficina:</label>
          <input type="number" id="tasaOficina${transactionCount}" min="0" step="any">
        </div>
        <div class="form-group">
          <label for="comisionBancaria${transactionCount}">Comisión Bancaria:</label>
          <select id="comisionBancaria${transactionCount}">
            <option value="100.0000">100,0000%</option>
            <option value="100.1000">100,1000%</option>
            <option value="100.2500">100,2500%</option>
            <option value="100.3000">100,3000%</option>
            <option value="Otra">Otra</option>
          </select>
          <input type="number" id="otraComision${transactionCount}" min="0" step="any" style="display:none;" placeholder="Ingrese otra comisión">
        </div>
        <div class="form-group">
          <label for="comision${transactionCount}">Comisión:</label>
          <input type="text" id="comision${transactionCount}" readonly>
        </div>
        <button type="button" class="calculateTransaction" data-id="${transactionCount}">Calcular Transacción</button>
        <button type="button" class="editTransaction" data-id="${transactionCount}" style="display:none;">Editar</button>
        <button type="button" class="deleteTransaction" data-id="${transactionCount}" style="display:none;">Eliminar</button>
      `;
      transactionsDiv.appendChild(transactionForm);
  
      const comisionBancariaSelect = document.getElementById(`comisionBancaria${transactionCount}`);
      const otraComisionInput = document.getElementById(`otraComision${transactionCount}`);
      const calculateTransactionBtn = transactionForm.querySelector('.calculateTransaction');
      const editTransactionBtn = transactionForm.querySelector('.editTransaction');
      const deleteTransactionBtn = transactionForm.querySelector('.deleteTransaction');
  
      comisionBancariaSelect.addEventListener('change', () => {
        if (comisionBancariaSelect.value === 'Otra') {
          otraComisionInput.style.display = 'block';
        } else {
          otraComisionInput.style.display = 'none';
        }
      });
  
      calculateTransactionBtn.addEventListener('click', () => {
        const id = calculateTransactionBtn.getAttribute('data-id');
        calculateTransaction(id);
  
        // Mostrar botones de editar y eliminar
        editTransactionBtn.style.display = 'inline-block';
        deleteTransactionBtn.style.display = 'inline-block';
        calculateTransactionBtn.style.display = 'none';
  
        // Deshabilitar campos después de calcular
        disableTransactionFields(id, true);
      });
  
      editTransactionBtn.addEventListener('click', () => {
        const id = editTransactionBtn.getAttribute('data-id');
        // Habilitar campos para edición
        disableTransactionFields(id, false);
        calculateTransactionBtn.style.display = 'inline-block';
        editTransactionBtn.style.display = 'none';
        deleteTransactionBtn.style.display = 'none';
  
        // Remover la transacción actual de la lista y actualizar totales
        removeTransaction(id);
      });
  
      deleteTransactionBtn.addEventListener('click', () => {
        const id = deleteTransactionBtn.getAttribute('data-id');
        removeTransaction(id);
        // Eliminar el formulario de la transacción
        transactionForm.remove();
        updateResults();
      });
    });
  
    function disableTransactionFields(id, disable) {
      const fields = [
        `operatorName${id}`,
        `monto${id}`,
        `tasaVenta${id}`,
        `tasaOficina${id}`,
        `comisionBancaria${id}`,
        `otraComision${id}`,
      ];
      fields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.disabled = disable;
        }
      });
    }
  
    function removeTransaction(id) {
      const index = transactions.findIndex((t) => t.id === id);
      if (index !== -1) {
        // Restar el monto de la transacción eliminada
        totalMonto -= transactions[index].monto;
        transactions.splice(index, 1);
      }
    }
  
    function calculateTransaction(id) {
      const operatorNameInput = document.getElementById(`operatorName${id}`);
      const montoInput = document.getElementById(`monto${id}`);
      const tasaVentaInput = document.getElementById(`tasaVenta${id}`);
      const tasaOficinaInput = document.getElementById(`tasaOficina${id}`);
      const comisionBancariaSelect = document.getElementById(`comisionBancaria${id}`);
      const otraComisionInput = document.getElementById(`otraComision${id}`);
      const comisionInput = document.getElementById(`comision${id}`);
  
      const operatorName = operatorNameInput.value;
      const monto = parseFloat(montoInput.value) || 0;
      const tasaVenta = parseFloat(tasaVentaInput.value) || 0;
      const tasaOficina = parseFloat(tasaOficinaInput.value) || null;
  
      let comisionBancariaValue = comisionBancariaSelect.value;
      if (comisionBancariaValue === 'Otra') {
        comisionBancariaValue = parseFloat(otraComisionInput.value) || 0;
      } else {
        comisionBancariaValue = parseFloat(comisionBancariaValue);
      }
  
      if (!operatorName || !monto || !tasaVenta || !comisionBancariaValue) {
        alert('Por favor, complete todos los campos requeridos en la transacción.');
        return;
      }
  
      // Calcular Comisión Bancaria Factor
      const comisionBancariaFactor = comisionBancariaValue / 100;
  
      // Calcular Comisión
      let comision;
      if (tasaOficina) {
        comision = tasaOficina * comisionBancariaFactor;
      } else {
        comision = tasaCliente * comisionBancariaFactor;
      }
      comisionInput.value = formatNumber(comision);
  
      // Actualizar total monto
      totalMonto += monto;
  
      // Almacenar datos de la transacción
      const transaction = {
        id: id,
        operatorName: operatorName,
        monto: monto,
        tasaVenta: tasaVenta,
        tasaOficina: tasaOficina,
        comisionBancariaFactor: comisionBancariaFactor,
        comision: comision,
      };
  
      // Si la transacción ya existe, actualizarla
      const existingIndex = transactions.findIndex((t) => t.id === id);
      if (existingIndex !== -1) {
        // Restar el monto anterior
        totalMonto -= transactions[existingIndex].monto;
        transactions[existingIndex] = transaction;
        // Sumar el nuevo monto
        totalMonto += monto;
      } else {
        transactions.push(transaction);
      }
  
      // Establecer Tasa Oficina global si no está establecida
      if (tasaOficina && tasaOficinaGlobal === null) {
        tasaOficinaGlobal = tasaOficina;
      }
  
      // Si ya hay una Tasa Oficina global y la actual es diferente, mostrar advertencia
      if (tasaOficina && tasaOficinaGlobal !== null && tasaOficina !== tasaOficinaGlobal) {
        alert('Atención: La Tasa Oficina difiere entre transacciones. Se utilizará la Tasa Oficina de la primera transacción para el cálculo del Total Oficina.');
      }
  
      // Actualizar resultados parciales
      updateResults();
  
      // Verificar si se alcanzó el monto deseado
      if (totalMonto >= montoQueDeseaVender) {
        addTransactionBtn.disabled = true;
        alert('Se ha alcanzado o superado el monto que desea vender el cliente.');
      } else {
        addTransactionBtn.disabled = false;
      }
    }
  
    function updateResults() {
      resultsDiv.innerHTML = '';
      let totalVenta = 0;
      let totalDiferencia = 0;
      let totalARepartir = 0;
      let totalOficinaPZO = 0;
      let totalOficinaCCS = 0;
      let totalEjecutivo = 0;
      let totalGananciaOficina = 0;
      let totalGananciaCliente = 0;
      let totalOficina = 0;
  
      const detailedResultsDiv = document.createElement('div');
  
      transactions.forEach((transaction, index) => {
        const id = transaction.id;
        const operatorName = transaction.operatorName;
        const monto = transaction.monto;
        const tasaVenta = transaction.tasaVenta;
        const tasaOficina = transaction.tasaOficina;
        const comision = transaction.comision;
        const comisionBancariaFactor = transaction.comisionBancariaFactor;
  
        const montoComision = monto * comision;
  
        const transactionTotalVenta = monto * tasaVenta;
        totalVenta += transactionTotalVenta;
  
        const diferencia = transactionTotalVenta - montoComision;
        totalDiferencia += diferencia;
  
        // Inicializar variables
        let aRepartir = 0;
        let oficinaPZO = 0;
        let oficinaCCS = 0;
        let ejecutivo = 0;
        let gananciaOficina = 0;
        let gananciaCliente = 0;
  
        if (tasaOficina) {
          // Calcular A Repartir
          aRepartir = diferencia / comision;
          totalARepartir += aRepartir;
  
          // Calcular distribuciones
          oficinaPZO = aRepartir * 0.30;
          oficinaCCS = aRepartir * 0.30;
          ejecutivo = aRepartir * 0.40;
  
          totalOficinaPZO += oficinaPZO;
          totalOficinaCCS += oficinaCCS;
          totalEjecutivo += ejecutivo;
  
          // Calcular Ganancia en Oficina
          gananciaOficina = (monto * (tasaOficina - tasaCliente)) / tasaCliente;
          totalGananciaOficina += gananciaOficina;
  
          // Ganancia en Cliente
          gananciaCliente = oficinaPZO + oficinaCCS;
          totalGananciaCliente += gananciaCliente;
        } else {
          // Cuando no se proporciona Tasa Oficina
          // Ganancia en Cliente = Diferencia / Tasa Cliente
          gananciaCliente = diferencia / tasaCliente;
          totalGananciaCliente += gananciaCliente;
        }
  
        // Mostrar resultados de la transacción
        const transactionResultDiv = document.createElement('div');
        transactionResultDiv.classList.add('transaction-result');
  
        let transactionResultHTML = `
          <h3>Transacción ${id} - Operador: ${operatorName}</h3>
          <table class="result-table">
            <tr>
              <th>Concepto</th>
              <th>Valor</th>
            </tr>
            <tr>
              <td>Total de la Venta</td>
              <td>${formatNumber(transactionTotalVenta)}</td>
            </tr>
            <tr>
              <td>Diferencia</td>
              <td>${formatNumber(diferencia)}</td>
            </tr>
        `;
  
        if (tasaOficina) {
          transactionResultHTML += `
            <tr>
              <td>A Repartir</td>
              <td>${formatNumber(aRepartir)}</td>
            </tr>
            <tr>
              <td>Oficina PZO</td>
              <td>${formatNumber(oficinaPZO)}</td>
            </tr>
            <tr>
              <td>Oficina CCS</td>
              <td>${formatNumber(oficinaCCS)}</td>
            </tr>
            <tr>
              <td>Ejecutivo</td>
              <td>${formatNumber(ejecutivo)}</td>
            </tr>
            <tr>
              <td>Ganancia en Oficina</td>
              <td>${formatNumber(gananciaOficina)}</td>
            </tr>
            <tr>
              <td>Ganancia en Cliente</td>
              <td>${formatNumber(gananciaCliente)}</td>
            </tr>
          `;
        } else {
          transactionResultHTML += `
            <tr>
              <td>Ganancia en Cliente</td>
              <td>${formatNumber(gananciaCliente)}</td>
            </tr>
          `;
        }
  
        transactionResultHTML += `</table>`;
        transactionResultDiv.innerHTML = transactionResultHTML;
        detailedResultsDiv.appendChild(transactionResultDiv);
      });
  
      // Mostrar totales generales
      const totalsDiv = document.createElement('div');
      let totalsHTML = `
        <h3>Totales de la Operación</h3>
        <table class="result-table">
          <tr>
            <th>Concepto</th>
            <th>Total</th>
          </tr>
      `;
  
      if (tasaOficinaGlobal) {
        totalOficina = montoQueDeseaVender * tasaOficinaGlobal;
        totalsHTML += `
          <tr>
            <td>Total Oficina</td>
            <td>${formatNumber(totalOficina)}</td>
          </tr>
        `;
      }
  
      totalsHTML += `
        <tr>
          <td>Total de la Venta</td>
          <td>${formatNumber(totalVenta)}</td>
        </tr>
        <tr>
          <td>Diferencia</td>
          <td>${formatNumber(totalDiferencia)}</td>
        </tr>
      `;
  
      if (totalARepartir > 0) {
        totalsHTML += `
          <tr>
            <td>A Repartir</td>
            <td>${formatNumber(totalARepartir)}</td>
          </tr>
          <tr>
            <td>Oficina PZO</td>
            <td>${formatNumber(totalOficinaPZO)}</td>
          </tr>
          <tr>
            <td>Oficina CCS</td>
            <td>${formatNumber(totalOficinaCCS)}</td>
          </tr>
          <tr>
            <td>Ejecutivo</td>
            <td>${formatNumber(totalEjecutivo)}</td>
          </tr>
          <tr>
            <td>Ganancia en Oficina</td>
            <td>${formatNumber(totalGananciaOficina)}</td>
          </tr>
        `;
      }
  
      totalsHTML += `
        <tr>
          <td>Ganancia en Cliente</td>
          <td>${formatNumber(totalGananciaCliente)}</td>
        </tr>
      `;
  
      // Calcular monto restante
      const montoRestante = montoQueDeseaVender - totalMonto;
      totalsHTML += `
        <tr>
          <td>Monto Vendido</td>
          <td>${formatNumber(totalMonto)}</td>
        </tr>
        <tr>
          <td>Monto Restante</td>
          <td>${formatNumber(montoRestante > 0 ? montoRestante : 0)}</td>
        </tr>
        </table>
      `;
  
      totalsDiv.innerHTML = totalsHTML;
  
      resultsDiv.appendChild(detailedResultsDiv);
      resultsDiv.appendChild(totalsDiv);
    }
  });
  