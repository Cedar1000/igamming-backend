const reorderArray = (array: any[], index: number): any[] => {
  return [...array.slice(index), ...array.slice(0, index)];
};

export default reorderArray;
