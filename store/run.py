import os


js = ('C:/Users/PC/Downloads/do_an_tt/bluesky/store/js/product_admin.js',)

def check_file_exists():
    for file in js:
        if os.path.isfile(file):
            print(f"Đã tìm thấy: {file}")
        else:
            print(f"Không tìm thấy: {file}")

check_file_exists()
