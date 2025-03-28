import { defineStore } from 'pinia';

export const useBreadcrumbStore = defineStore('breadcrumb', {
    state: () => ({
        breadcrumbBoards: [] as { id: string; name: string; color: string }[]
    }),
    actions: {
        addBoard(board: { id: string; name: string; color: string }) {
            this.breadcrumbBoards.push(board);
        },
        navigateToBoard(index: number) {
            this.breadcrumbBoards = this.breadcrumbBoards.slice(0, index + 1);
        }
    }
});