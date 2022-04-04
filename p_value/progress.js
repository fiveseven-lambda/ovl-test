export async function show_progress(s) {
  await new Promise(resolve => setTimeout(() => {
    $('#progress').text(s);
    resolve();
  }));
}