Vue.component('card', {
    props: ['card', 'columnIndex'],
    template: `
    <div class="card" :class="{ completed: card.status === 'completed', overdue: card.status === 'overdue' }">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <p>Дата создания: {{ card.createdAt }}</p>
            <p>Последнее редактирование: {{ card.updatedAt }}</p>
            <p>Дедлайн: {{ card.deadline }}</p>
            <p v-if="card.reasonForMove">Причина возврата: {{ card.reasonForMove }}</p>
            <p>Debug: {{ card }}</p>
            <button class="but" @click="editCard">Редактировать</button>
            <button class="but" v-if="columnIndex === 0" @click="moveCard(1)">В работу</button>
            <button class="but" v-if="columnIndex === 1" @click="moveCard(2)">Тестирование</button>
            <button class="but" v-if="columnIndex === 2" @click="moveCard(3)">Завершить работу</button>
            <button class="but" v-if="columnIndex === 2" @click="returnToWork">Возобновить работу</button>
        </div>
    `,
    methods: {
        editCard() {
            this.$emit('edit-card');
        },
        deleteCard() {
            this.$emit('delete-card');
        },
        moveCard(toColumnIndex) {
            this.$emit('move-card', toColumnIndex);
        },
        returnToWork() {
            const reason = prompt('Укажите причину возврата в работу:');
            if (reason) {
                this.$emit('move-card', 1, reason);
            }
            else {
                console.log('Причина возврата не указана');
            }
        }
    }
});

Vue.component('column', {
    props: ['column', 'columnIndex'],
    template: `
        <div class="column">
        <h2>{{ column.title }}</h2>
        <div v-if="columnIndex === 0">
            <input class="form" type="text" v-model="newCardTitle" placeholder="Заголовок">
            <textarea class="form" v-model="newCardDescription" placeholder="Описание задачи"></textarea>
            <input class="data" type="date" v-model="newCardDeadline">
            <button class="but" @click="addCard">Добавить</button>
        </div>
        <card 
        v-for="(card, cardIndex) in column.cards" 
        :key="cardIndex" 
        :card="card" 
        :column-index="columnIndex" 
            @edit-card="editCard(cardIndex)" 
            @delete-card="deleteCard(cardIndex)" 
            @move-card="moveCard(cardIndex, $event)">       
        </card>
    </div>
            `,
    data() {
        return {
            newCardTitle: '',
            newCardDescription: '',
            newCardDeadline: '',
            reasonForMove: ''
        };
    },
    methods: {
        addCard() {
            if (this.newCardTitle.trim() === '' || this.newCardDescription.trim() === '' || this.newCardDeadline === '') {
                alert('Заполните все поля');
                return;
            }
            const newCard = {
                title: this.newCardTitle,
                description: this.newCardDescription,
                createdAt: new Date().toLocaleString(),
                updatedAt: new Date().toLocaleString(),
                deadline: this.newCardDeadline,
                status: 'planned',
                reasonForMove: null,
            };
            this.$emit('add-card', this.columnIndex, newCard);
            this.newCardTitle = '';
            this.newCardDescription = '';
            this.newCardDeadline = '';
        },
        editCard(cardIndex) {
            this.$emit('edit-card', this.columnIndex, cardIndex);
        },
        deleteCard(cardIndex) {
            this.$emit('delete-card', this.columnIndex, cardIndex);
        },
        moveCard(cardIndex, toColumnIndex) {
            this.$emit('move-card', this.columnIndex, toColumnIndex, cardIndex);
        },
    }
});
new Vue({
    el: '#app',
    data() {
        return {
            columns: [
                { title: 'Запланированные задачи', cards: [] },
                { title: 'Задачи в работе', cards: [] },
                { title: 'Тестирование', cards: [] },
                { title: 'Выполненные задачи', cards: [] }
            ]
        };
    },
    methods: {
        addCard(columnIndex, newCard) {
            this.columns[columnIndex].cards.push(newCard);
            this.saveToLocalStorage();
        },
        moveCard(fromColumnIndex, toColumnIndex, cardIndex, reason) {
            const card = this.columns[fromColumnIndex].cards.splice(cardIndex, 1)[0];
            if (toColumnIndex === 3) {
                const deadline = new Date(card.deadline);
                const now = new Date();
                card.status = deadline < now ? 'overdue' : 'completed';
            }
            if (reason) {
                card.reasonForMove = reason;
                console.log('Причина возврата сохранена:', reason);
            } else {
                console.log('Причина возврата не передана');
            }
            this.columns[toColumnIndex].cards.push(card);
            this.saveToLocalStorage();
        },
        editCard(columnIndex, cardIndex) {
            const card = this.columns[columnIndex].cards[cardIndex];
            const newTitle = prompt('Введите новый заголовок:', card.title);
            const newDescription = prompt('Введите новое описание:', card.description);
            const newDeadline = prompt('Введите новый дедлайн:', card.deadline);
            if (newTitle && newDescription && newDeadline) {
                card.title = newTitle;
                card.description = newDescription;
                card.deadline = newDeadline;
                card.updatedAt = new Date().toLocaleString();
                this.saveToLocalStorage();
            }
        },
        deleteCard(columnIndex, cardIndex) {
            this.columns[columnIndex].cards.splice(cardIndex, 1);
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem('kanbanBoard', JSON.stringify(this.columns));
        },
        loadFromLocalStorage() {
            const data = localStorage.getItem('kanbanBoard');
            if (data) {
                this.columns = JSON.parse(data);
                console.log('Данные загружены из localStorage:', this.columns);
            } else {
                console.log('Данные в localStorage отсутствуют');
            }
        },
    },
    created() {
        this.loadFromLocalStorage();
    }
});