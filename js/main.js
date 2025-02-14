Vue.component('card', {
    props: ['card', 'columnIndex'],
    template: `
    <div class="card" :class="{ completed: card.status === 'completed', overdue: card.status === 'overdue' }">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <p>Дата создания: {{ card.createdAt }}</p>
            <p>Последнее редактирование: {{ card.updatedAt }}</p>
            <p>Дедлайн: {{ card.deadline }}</p>
            <button @click="editCard">Редактировать</button>
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
    }
});

Vue.component('column', {
    props: ['column', 'columnIndex'],
    template: `
                <div class="column">
                    <h2>{{ column.title }}</h2>
                    <div v-if="columnIndex === 0">
                        <input class="form" v-model="newCardTitle" placeholder="Заголовок">
                        <textarea class="form" v-model="newCardDescription" placeholder="Описание задачи"></textarea>
                        <input class="data" type="date" v-model="newCardDeadline">
                        <button class="but" @click="addCard">Добавить карточку</button>
                    </div>
                </div>
            `,
    data() {
        return {
            newCardTitle: '',
            newCardDescription: '',
            newCardDeadline: ''
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
                status: 'planned'
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
        },
        moveCard(fromColumnIndex, toColumnIndex, cardIndex, reason) {
            const card = this.columns[fromColumnIndex].cards.splice(cardIndex, 1)[0];
            if (toColumnIndex === 3) {
                const deadline = new Date(card.deadline);
                const now = new Date();
                card.status = deadline < now ? 'просрочено' : 'выполнено';
            }
            if (reason) {
                card.reasonForMove = reason;
            }
            this.columns[toColumnIndex].cards.push(card);
    
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
            }
        },
        deleteCard(columnIndex, cardIndex) {
            this.columns[columnIndex].cards.splice(cardIndex, 1);
        },
    }
});