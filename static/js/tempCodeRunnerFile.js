function showCustomPopup(title, content) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999;';
    
    var popup = document.createElement('div');
    popup.innerHTML = '<h3 style="font-weight:bold; color:black; margin-bottom: 10px;">' + title + '</h3><p style="font-weight:bold; color:black; line-height: 1.5;">' + content + '</p>';
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border:1px solid black;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,0.1);z-index:1000;max-width:80%;max-height:80%;overflow:auto;font-family:Arial, sans-serif;';
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    var closeButton = document.createElement('button');
    closeButton.textContent = 'Đóng';
    closeButton.style.cssText = 'margin-top: 10px; padding: 5px 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;';
    closeButton.onclick = function(e) { 
        e.stopPropagation();
        document.body.removeChild(overlay); 
    };
    popup.appendChild(closeButton);
    
    overlay.onclick = function() {
        document.body.removeChild(overlay);
    };
    
    popup.onclick = function(e) {
        e.stopPropagation();
    };
}
