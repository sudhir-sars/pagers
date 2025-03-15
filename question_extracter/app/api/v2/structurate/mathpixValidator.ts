export async function mathpixValidator(inputText: string): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3005/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputText }),
    });

    if (!response.ok) {
      console.error('Error calling mathpix validator server:', response.statusText);
      return false;
    }

    const data = await response.json();
    // Expecting a JSON response of the form { valid: true/false }
    return data.valid;
  } catch (error) {
    console.error('Error calling mathpix validator server:', error);
    return false;
  }
}
