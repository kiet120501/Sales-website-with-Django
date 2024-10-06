from django import forms

class BaseForm(forms.Form):
    def __init__(self,  *args, **kargs):
        super(BaseForm, self).__init__(*args, **kargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'login__input'
            visible.field.widget.attrs['placeholder'] = visible.field.label

class LoginForm(BaseForm):
    username = forms.CharField(label='Tên đăng nhập', max_length=20)
    password = forms.CharField(label='Mật khẩu', widget=forms.PasswordInput())

class RegisterForm(BaseForm):
    username = forms.CharField(label='Tên đăng nhập', max_length=20)
    password = forms.CharField(label='Mật khẩu', widget=forms.PasswordInput())
    re_password = forms.CharField(label='Nhập lại mật khẩu', widget=forms.PasswordInput())
