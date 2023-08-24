def load_password_file(file_path):
    result_dict = {}
    try:
        with open(file_path, 'r', encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if line:
                    elements = line.split(' ')
                    tmp = []
                    key = elements[0]
                    for i in range(1, len(elements)):
                        tmp.append(elements[i])
                    result_dict[key] = tmp
        return result_dict
    except:
        return "Failed!"