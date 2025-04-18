function combineArrays(arrays: number[][]): number[] {
  const combinedArray: number[] = [];

  // Iterate over each index of the arrays
  for (let i = 0; i < arrays[0].length; i++) {
    let sum = 0;

    // Iterate over each array and sum up their corresponding elements
    for (let j = 0; j < arrays.length; j++) {
      sum += arrays[j][i];
    }

    // Push the sum to the combined array
    combinedArray.push(sum);
  }

  return combinedArray;
}

export default combineArrays;
