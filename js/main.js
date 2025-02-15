document.addEventListener('DOMContentLoaded', function () {
    Vue.component('card', {
        props: ['card', 'columnIndex'],
        template: `
            <div class="card">
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <p>Создано: {{ card.createdAt }}</p>
                <p v-if="card.lastEdited">Изменено: {{ card.lastEdited }}</p>
                <p>Дедлайн: {{ card.deadline }}</p>
                <p v-if="card.isOverdue" class="overdue">Просрочено</p>
                <p v-if="card.isCompleted" class="completed">Выполнено в срок</p>
                <p v-if="card.returnReason">Причина возврата: {{ card.returnReason }}</p>
                <div>
                    <button class="but" v-if="columnIndex !== 3" @click="$emit('edit-card')">Редактировать</button>
                    <button class="but" @click="$emit('delete-card')">Удалить</button>
                    <button class="but" v-if="columnIndex === 0" @click="move(1)">В работу</button>
                    <button class="but" v-if="columnIndex === 1" @click="move(2)">Тестирование</button>
                    <button class="but" v-if="columnIndex === 2" @click="returnToWork">Вернуть</button>
                    <button class="but" v-if="columnIndex === 2" @click="move(3)">Завершить</button>
                </div>
            </div>
        `,
        methods: {
            move(toColumn) {
                this.$emit('move-card', {
                    cardId: this.card.id,
                    from: this.columnIndex,
                    to: toColumn
                });
            },
            returnToWork() {
                const reason = prompt('Укажите причину возврата в работу:');
                if (reason) {
                    this.$emit('move-card', {
                        cardId: this.card.id,
                        from: this.columnIndex,
                        to: 1,
                        reason: reason
                    });
                }
            }
        }
    });

Vue.component('column', {
    props: ['column', 'columnIndex'],
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <card 
                v-for="card in column.cards" 
                :key="card.id" 
                :card="card" 
                :column-index="columnIndex"
                @edit-card="$emit('edit-card', card)"
                @delete-card="$emit('delete-card', card.id)"
                @move-card="$emit('move-card', $event)"
            />
        </div>
    `
});
Vue.component('board', {
    props: ['columns'],
    template: `
        <div class="board">
            <column 
                v-for="(column, index) in columns" 
                :key="index" 
                :column="column" 
                :column-index="index"
                @edit-card="$emit('edit-card', $event)"
                @delete-card="$emit('delete-card', $event)"
                @move-card="$emit('move-card', $event)"
            />
        </div>
    `
});

new Vue({
    el: '#app',
    data: () => ({
        columns: [
            { title: 'Запланированное', cards: [] },
            { title: 'В процессе', cards: [] },
            { title: 'Тестирование', cards: [] },
            { title: 'Завершенные', cards: [] }
        ],
        formData: { title: '', description: '', deadline: '' },
        editingCard: null
    }),
    created() {
        this.loadFromLocalStorage();
    },
    methods: {
        addCard() {
            this.formData = { title: '', description: '', deadline: '' };
            this.editingCard = null;
        },
        saveCard() {
            if (!this.formData.title || !this.formData.deadline) return;
            if (this.editingCard) {
                Object.assign(this.editingCard, this.formData, {
                    lastEdited: new Date().toLocaleString()
                });
            } else {
                this.columns[0].cards.push({
                    id: Date.now(),
                    ...this.formData,
                    createdAt: new Date().toLocaleString(),
                    lastEdited: null,
                    isOverdue: false,
                    isCompleted: false,
                    returnReason: null
                });
            }
            this.saveToLocalStorage(); // Сохраняем в localStorage
            this.formData = { title: '', description: '', deadline: '' };
            this.editingCard = null; // Сбрасываем состояние редактирования
        },
        editCard(card) {
            this.formData = { ...card };
            this.editingCard = card;
        },
        deleteCard(cardId) {
            this.columns.forEach(col => col.cards = col.cards.filter(c => c.id !== cardId));
            this.saveToLocalStorage(); // Сохраняем в localStorage
        },
        moveCard({ cardId, from, to, reason }) {
            const card = this.findCard(cardId);
            if (!card) return;
            this.columns[from].cards = this.columns[from].cards.filter(c => c.id !== cardId);
            if (to === 3) {
                const deadline = new Date(card.deadline);
                card.isOverdue = new Date() > deadline;
                card.isCompleted = !card.isOverdue;
                card.returnReason = null;
            }
            if (reason) {
                card.returnReason = reason;
            }
            this.columns[to].cards.push(card);
            this.saveToLocalStorage(); // Сохраняем в localStorage
        },
        findCard(cardId) {
            for (const col of this.columns) {
                const card = col.cards.find(c => c.id === cardId);
                if (card) return card;
            }
            return null;
        },
        saveToLocalStorage() {
            localStorage.setItem('taskBoard', JSON.stringify(this.columns));
        },
        loadFromLocalStorage() {
            const data = localStorage.getItem('taskBoard');
            if (data) {
                this.columns = JSON.parse(data);
            }
        }
    }
});
});