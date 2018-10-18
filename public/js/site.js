$(document).ready(() => {
  BtslrCO.init();
  const currentYear = (new Date).getFullYear();
  $('#year').text(currentYear);
});
var BtslrCO = {
  clipboard: '',
  init() {
    BtslrCO.initClipboard();
    BtslrCO.observeFormSubmissions();
    BtslrCO.observeRestarts();
  },
  initClipboard() {
    BtslrCO.clipboard = new ClipboardJS('#copy-button', {
      target(trigger) {
        return trigger.previousElementSibling;
      }
    });
    BtslrCO.clipboard.on('mouseover', () => {
      $('#copy-button').addClass('hover');
    });
    BtslrCO.clipboard.on('success', (e) => {
      console.log(e);
      $('#output-url').val(e.text);
      $('#copy-button').addClass('active');
      $('#copied-msg').show();
      const t = setTimeout(() => {
        clearTimeout(t);
        $('#copy-button').removeClass('active');
      }, 3000);
    });
    BtslrCO.clipboard.on('error', e => {
      console.error('Action:', e.action);
      console.error('Trigger:', e.trigger);
    });
  },
  observeFormSubmissions() {
    $('form').submit(e => {
      const form = $(e.target);
      e.preventDefault();
      $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: {
          url: $('#input-url').val()
        },
        success(data) {
          const outputURL = `https://${data.url}`;
          $('#output-url').val(outputURL).select();
          $('#input-url').removeClass('error');
          $('.arrow_box').hide();
          $('#bar').addClass('flipped');
        },
        error(xhr, ajaxOptions, thrownError) {
          $('#error').text(xhr.responseText);
          $('#input-url').addClass('error');
          $('.arrow_box').show();
        }
      });
    });
  },
  observeRestarts() {
    $('a#restart').click(e => {
      e.preventDefault();
      $('#input-url').val('').focus();
      $('#output-url').val('');
      $('#copied-msg').hide();
      $('#bar').removeClass('flipped');
    });
  }
};