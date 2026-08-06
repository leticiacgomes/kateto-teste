export const roundRobinService = {
  // Ordem fixa: Marcelo(0) -> Rafael(1) -> Renato(2) -> Pedro(3) -> Leonardo(4)
  // -> repete. Pura, sem I/O, testável sem subir banco nem UI.
  computeNextIndex(currentIndex: number, totalRepresentatives: number): number {
    return (currentIndex + 1) % totalRepresentatives;
  },
};
