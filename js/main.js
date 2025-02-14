Vue.component('column', {
    props: ['column', 'column-index'],
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
        }
    }
});