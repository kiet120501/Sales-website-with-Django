function showCustomPopup(title, content) {
    // Tạo các phần tử HTML cho pop-up
    var popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000;';
    
    var popupContent = document.createElement('div');
    popupContent.style.cssText = 'background:white;padding:20px;border-radius:5px;max-width:80%;max-height:80%;overflow:auto;';
    
    var popupTitle = document.createElement('h2');
    popupTitle.textContent = title;
    
    var popupText = document.createElement('p');
    popupText.innerHTML = content;
    
    var closeButton = document.createElement('button');
    closeButton.textContent = 'Đóng';
    closeButton.style.cssText = 'margin-top:10px;padding:5px 10px;';
    closeButton.onclick = function() {
        document.body.removeChild(popup);
    };
    
    // Thêm các phần tử vào pop-up
    popupContent.appendChild(popupTitle);
    popupContent.appendChild(popupText);
    popupContent.appendChild(closeButton);
    popup.appendChild(popupContent);
    
    // Thêm pop-up vào body
    document.body.appendChild(popup);
}