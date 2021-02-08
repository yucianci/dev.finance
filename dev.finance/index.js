 
const modal = {
    open() {
        document.querySelector('.modal__overlay').classList.add('active')
    },
    closed() {
        document.querySelector('.modal__overlay').classList.remove('active')
        form.clearFields();
    }
};

const storage ={
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
    },
    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
    }
};

const transactionAction = {
    all: storage.get(),
    add(transaction) {
        transactionAction.all.push(transaction);
        App.reload();
    },
    remove(index) {
        transactionAction.all.splice(index, 1);
        App.reload();
    },
    income() {
        let valueIncome = 0;
        transactionAction.all.forEach((transaction) => {
            if(transaction.amount > 0) valueIncome += transaction.amount;
        })
        return valueIncome;
    },
    expense() {
        let valueExpense = 0;
        transactionAction.all.forEach((transaction) => {
            if(transaction.amount < 0) valueExpense += transaction.amount;
        })
        return valueExpense;
    },
    total() {
        return transactionAction.income() + transactionAction.expense();
    }
};

const insertHtml = {
    transactionContainer: document.querySelector('.data__table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = insertHtml.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        insertHtml.transactionContainer.appendChild(tr);
        
    },
    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount >= 0 ? 'income' : 'expense';
        const amount = tools.formatCurrency(transaction.amount);
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="transactionAction.remove(${index})" class="button minus"src="assets/minus.svg" alt="Remover transação" width="22"></td>
        `;
        return html;
    },
    updateBalance() {
        document.querySelector('.display__income').innerHTML = tools.formatCurrency(transactionAction.income());
        document.querySelector('.display__expense').innerHTML = tools.formatCurrency(transactionAction.expense());
        document.querySelector('.display__total').innerHTML = tools.formatCurrency(transactionAction.total());
    },
    clearTransaction() {
        insertHtml.transactionContainer.innerHTML = '';
    }
};

const tools = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '';
        value = String(value).replace(/\D/g, '');
        value = Number(value) / 100;
        value = value.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        })
        return `${signal} ${value}`;
    },
    formatAmount(value) {
        value = Number(value) * 100;
        return value;
    },
    formatDate(value) {
        const splittedDate = value.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    }
};

const form = {
    description : document.querySelector('input#description'),
    amount : document.querySelector('input#amount'),
    date : document.querySelector('input#date'),
    getValues() {
        return {
            description : form.description.value,
            amount : form.amount.value,
            date : form.date.value
        };
    },
    validateField() {
        const {description, amount, date} = form.getValues();
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") throw new Error('Preencha todos os dados!');
    },
    formatValues() {
        let {description, amount, date} = form.getValues();
        amount = tools.formatAmount(amount);
        date = tools.formatDate(date);
        return {
            description : description,
            amount : amount,
            date : date
        }
    },
    saveTransaction(transaction) {
        transactionAction.add(transaction);
    },
    clearFields() {
        form.description.value = '';
        form.amount.value = '';
        form.date.value = '';
    },
    submit(event) {
        event.preventDefault();
        try {
            form.validateField();
            const transaction = form.formatValues();
            form.saveTransaction(transaction);
            form.clearFields();
            modal.closed();
        } catch (error) {
            alert(error.message)
        }
        
    }
};

const App = {
    init() {
        transactionAction.all.forEach((transaction, index) => {
            insertHtml.addTransaction(transaction, index);
        })
        insertHtml.updateBalance();
        storage.set(transactionAction.all);
    },
    reload() {
        insertHtml.clearTransaction();
        App.init();
    }
};

App.init();



