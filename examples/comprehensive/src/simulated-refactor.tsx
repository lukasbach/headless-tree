// Simulated DOM manipulation code smell
export function BadComponent() {
  // DOM manipulation code smell
  const updateElement = () => {
    const element = document.getElementById('my-div');
    if (element) {
      element.innerHTML = '<span>New content</span>';
    }
  };
  
  return <button onClick={updateElement}>Update</button>;
}
