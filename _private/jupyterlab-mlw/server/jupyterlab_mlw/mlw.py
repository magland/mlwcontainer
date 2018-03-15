"""
This is a Module where actual Commands are written & Executed &  the result
is sent back to the calling module.
"""
import os
import subprocess
from subprocess import Popen, PIPE


class MLW:
    """
    A single parent Class which has all the individual methods in it.
    """

    def status(self, current_path):
        """
        Function used to execute git status command & send back the result.
        """
        p = Popen(
            ["git", "status", "--porcelain"],
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.getcwd() + '/' + current_path)
        my_output, my_error = p.communicate()
        if (p.returncode == 0):
            result = []
            line_array = my_output.decode('utf-8').splitlines()
            for line in line_array:
                to1 = None
                from_path = line[3:]
                if line[0] == 'R':
                    to0 = line[3:].split(' -> ')
                    to1 = to0[len(to0) - 1]
                else:
                    to1 = line[3:]
                if to1.startswith('"'):
                    to1 = to1[1:]
                if to1.endswith('"'):
                    to1 = to1[:-1]
                result.append({
                    'x': line[0],
                    'y': line[1],
                    'to': to1,
                    'from': from_path
                })
            return {"code": p.returncode, "files": result}
        else:
            return {
                "code": p.returncode,
                'command': "git status --porcelain",
                "message": my_error.decode('utf-8')
            }
