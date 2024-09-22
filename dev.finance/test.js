// Modal para abrir e fechar a janela
const modal = {
    open() {
        document.querySelector('.modal__overlay').classList.add('active');
    },
    close() {
        document.querySelector('.modal__overlay').classList.remove('active');
        form.clearFields(); // Limpa os campos do formulário ao fechar
    }
};

// Manipulação do armazenamento local
const storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
    },
    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
    }
};

// Ações relacionadas às transações
const transactionAction = {
    all: storage.get(), // Carrega transações do armazenamento

    add(transaction) {
        this.all.push(transaction); // Adiciona nova transação
        App.reload(); // Recarrega a aplicação
    },

    remove(index) {
        this.all.splice(index, 1); // Remove transação pelo índice
        App.reload(); // Recarrega a aplicação
    },

    income() {
        let totalIncome = 0;
        this.all.forEach(transaction => {
            if (transaction.amount > 0) totalIncome += transaction.amount;
        });
        return totalIncome; // Retorna total de receitas
    },

    expense() {
        let totalExpense = 0;
        this.all.forEach(transaction => {
            if (transaction.amount < 0) totalExpense += transaction.amount;
        });
        return totalExpense; // Retorna total de despesas
    },

    total() {
        return this.income() + this.expense(); // Retorna total geral
    }
};

// Manipulação de HTML para exibir transações
const insertHtml = {
    transactionContainer: document.querySelector('.data__table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = this.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        this.transactionContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount >= 0 ? 'income' : 'expense';
        const amount = tools.formatCurrency(transaction.amount);
        return `
            <td class="description">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="transactionAction.remove(${index})" class="button minus" src="assets/minus.svg" alt="Remover transação" width="22"></td>
        `;
    },

    updateBalance() {
        document.querySelector('.display__income').innerHTML = tools.formatCurrency(transactionAction.income());
        document.querySelector('.display__expense').innerHTML = tools.formatCurrency(transactionAction.expense());
        document.querySelector('.display__total').innerHTML = tools.formatCurrency(transactionAction.total());
    },

    clearTransaction() {
        this.transactionContainer.innerHTML = ''; // Limpa transações exibidas
    }
};

// Ferramentas auxiliares
const tools = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '';
        value = String(value).replace(/\D/g, '');
        value = Number(value) / 100;
        return `${signal} ${value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    },
    formatAmount(value) {
        return Number(value) * 100; // Formata valor para centavos
    },
    formatDate(value) {
        const splittedDate = value.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`; // Formata data
    }
};

// Manipulação do formulário
const form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        };
    },

    validateField() {
        const { description, amount, date } = this.getValues();
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error('Preencha todos os dados!');
        }
    },

    formatValues() {
        let { description, amount, date } = this.getValues();
        amount = tools.formatAmount(amount); // Formata o valor
        date = tools.formatDate(date); // Formata a data
        return { description, amount, date };
    },

    saveTransaction(transaction) {
        transactionAction.add(transaction); // Salva a transação
    },

    clearFields() {
        this.description.value = '';
        this.amount.value = '';
        this.date.value = ''; // Limpa os campos
    },

    submit(event) {
        event.preventDefault(); // Previne o comportamento padrão do formulário
        try {
            this.validateField();
            const transaction = this.formatValues();
            this.saveTransaction(transaction);
            this.clearFields();
            modal.close(); // Fecha o modal
        } catch (error) {
            alert(error.message); // Exibe mensagem de erro
        }
    }
};

// Inicializa a aplicação
const App = {
    init() {
        transactionAction.all.forEach((transaction, index) => {
            insertHtml.addTransaction(transaction, index); // Adiciona transações na tabela
        });
        insertHtml.updateBalance(); // Atualiza saldo
        storage.set(transactionAction.all); // Salva no armazenamento
    },

    reload() {
        insertHtml.clearTransaction(); // Limpa a tabela
        this.init(); // Recarrega a aplicação
    }
};

// Chama a inicialização da aplicação
App.init();
